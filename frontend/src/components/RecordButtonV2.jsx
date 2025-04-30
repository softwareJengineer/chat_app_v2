/*  RecordButton.js  */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsStopCircle, BsPlayCircle } from 'react-icons/bs';

// Custom classes for handling audio
import AudioStreamer from './speechProviders/AudioStreamer'; // --- needs to be updated to have 2 simultaneous buffers for Gemini ---
import toBase64      from '../utils/toBase64';

// ASR & TTS classes (have other changes planned to make swapping between these better)
//import { AzureASR, AzureTTS } from './speechProviders/AzureServices'; // --- the subscriptionKey and serviceRegion shouldn't be passed here ---
import {  TestASR,  TestTTS } from './speechProviders/TestServices';

// Azure keys - move these to env vars
const subscriptionKey = '3249fb4e6d8248569b42d5dbf693c259';
const serviceRegion   = 'eastus';

// ====================================================================
// RecordButton (uses imported ASR & TTS classes)
// ====================================================================
function RecordButton({ parentCallback }) {
    const [recording,      setRecording     ] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking,   setUserSpeaking  ] = useState(false);

    // --------------------------------------------------------------------
    // References for user and system speaking status
    // --------------------------------------------------------------------
    // Needed for the checkOverlap() function because it is passed to the ASR object
    const systemSpeakingRef = useRef(false);
    const userSpeakingRef   = useRef(false);

    // Keep references in sync with state
    useEffect(() => {systemSpeakingRef.current = systemSpeaking;}, [systemSpeaking]);
    useEffect(() => {  userSpeakingRef.current =   userSpeaking;}, [  userSpeaking]);
    
    // --------------------------------------------------------------------
    // WebSocket Setup
    // --------------------------------------------------------------------
    const wsUrl = window.location.hostname === 'localhost'
        ? `ws://${window.location.hostname}:8000/ws/chat/`
        : `ws://${window.location.hostname}/ws/chat/`;
    // const wsUrl = "wss://dementia.ngrok.app";

    // Open and close the websocket connection on change of the 'recording' variable
    const wsRef = useRef(null);
    useEffect(() => {
        if (recording) {
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.onopen    = (     ) => {console.log("WebSocket connected"            ); console.log  ("Connected to:",     wsUrl);};
            wsRef.current.onerror   = (error) => {console.log(`WebSocket connection failed`    ); console.error("WebSocket error:",  error);};
            wsRef.current.onclose   = (event) => {console.log(`WebSocket closed: ${event.code}`); console.log  ("WebSocket closed:", event);};
            wsRef.current.onmessage = (event) => {const { type, data } = JSON.parse(event.data); if (type === 'llm_response') speakResponse(data);};
        } else if (wsRef.current) {wsRef.current.close();}
        return () => wsRef.current?.close();
      }, [recording]);
    
    // --------------------------------------------------------------------
    // ASR Wrapper
    // --------------------------------------------------------------------
    const asrRef = useRef(null);
    useEffect(() => {
        //asrRef.current = new AzureASR({subscriptionKey, serviceRegion,   // (Azure version)
        asrRef.current = new TestASR({
            onUtterance          : handleUtterance,
            onUserSpeakingChange : setUserSpeaking,
            onUserSpeakingStart  : checkOverlap
        });
        return () => asrRef.current?.stop_stream();
    }, []);

    // --------------------------------------------------------------------
    // TTS Wrapper
    // --------------------------------------------------------------------
    const ttsRef = useRef(null);
    useEffect(() => {
        //ttsRef.current = new AzureTTS({subscriptionKey, serviceRegion,   // (Azure version)
        ttsRef.current = new TestTTS({
            onStart : ()  => setSystemSpeaking(true ),
            onDone  : ()  => setSystemSpeaking(false),
        });
        return () => ttsRef.current?.stop();
    }, []);
    
    // --------------------------------------------------------------------
    //  Audio Streaming Wrapper
    // --------------------------------------------------------------------
    const audioStreamerRef = useRef(null);
    useEffect(() => {
        audioStreamerRef.current = new AudioStreamer({
            sampleRate : 16000,
            chunkMs    : 5000,
            onChunk    : (int16, timestamp) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    const base64 = toBase64(int16);
                    wsRef.current.send(JSON.stringify({
                        type      : 'audio_data',
                        timestamp : timestamp,
                        data      : base64,
                        sampleRate: 16000,
                    }));
                }
            },
            onError    : err => console.error('Audio error:', err)
        });
        return () => audioStreamerRef.current?.stop(); // (clean up on unmount)
    }, []);
 
    // --------------------------------------------------------------------
    // Start & Stop Recording
    // --------------------------------------------------------------------
    const startRecording = () => {
        // Set the recording variable to true and start streaming for the ASR object
        setRecording(true); 
        asrRef.current.start_stream();
        audioStreamerRef.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        asrRef.current.stop_stream();
        audioStreamerRef.current?.stop();
        wsRef.current?.close();
        ttsRef.current?.stop();  // (just in case speech is still playing)
    };

    // --------------------------------------------------------------------
    // Other Handlers
    // --------------------------------------------------------------------
    function handleUtterance (text) {console.log('Recognized:', text); addMessageToChat('You', text); sendToServer({ type: 'transcription', data: text });}
    function addMessageToChat(sender, message) {parentCallback([sender, message]);}
    function speakResponse   (text           ) {ttsRef.current?.speak(text);      }
    function sendToServer    (payload        ) {const ws = wsRef.current; if (ws && ws.readyState === WebSocket.OPEN) {ws.send(JSON.stringify(payload));}}

    function checkOverlap() {
        if (systemSpeakingRef.current && userSpeakingRef.current) {
            console.log('Overlapped speech detected');
            sendToServer({ type: 'overlapped_speech' });
        }
    }

    // --------------------------------------------------------------------
    // Button UI
    // --------------------------------------------------------------------
    return (
        <> 
            <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? <BsStopCircle /> : <BsPlayCircle />}
            </Button>
        </>
    );
}
export default RecordButton;