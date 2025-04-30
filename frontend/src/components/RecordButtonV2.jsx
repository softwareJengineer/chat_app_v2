/*  RecordButton.js  */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { BsStopCircle, BsPlayCircle } from 'react-icons/bs';

import { AzureASR, AzureTTS } from './speechProviders/AzureServices'
import AudioStreamer from './speechProviders/AudioStreamer';
import toBase64      from '../utils/toBase64';

// Azure keys - move these to env vars in production
const subscriptionKey = '3249fb4e6d8248569b42d5dbf693c259';
const serviceRegion   = 'eastus';


/* ====================================================================
    RecordButton => Uses imported files
==================================================================== */
function RecordButton({ parentCallback }) {
    const [recording,      setRecording     ] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking,   setUserSpeaking  ] = useState(false);

    // -------------------- References ---------------------------------------
    const systemSpeakingRef = useRef(false);
    const userSpeakingRef   = useRef(false);

    // Keep refs in sync with state
    useEffect(() => { systemSpeakingRef.current = systemSpeaking; }, [systemSpeaking]);
    useEffect(() => { userSpeakingRef.current   = userSpeaking;   }, [userSpeaking  ]);
    
    // -------------------- WebSocket ---------------------------------------
    const wsUrl = window.location.hostname === 'localhost'
        ? `ws://${window.location.hostname}:8000/ws/chat/`
        : `ws://${window.location.hostname}/ws/chat/`;
    // const wsUrl = "wss://dementia.ngrok.app";

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

    // -------------------- ASR Wrapper -------------------------------------
    const asrRef = useRef(null);
    useEffect(() => {
        asrRef.current = new AzureASR({subscriptionKey, serviceRegion,
            onUtterance          : handleUtterance,
            onUserSpeakingChange : setUserSpeaking,
            onUserSpeakingStart  : checkOverlap
        });
        return () => asrRef.current?.stop_stream();
    }, []);

    // -------------------- TTS Wrapper -------------------------------------
    const ttsRef = useRef(null);
    useEffect(() => {
        ttsRef.current = new AzureTTS({subscriptionKey, serviceRegion,
            onStart: ()  => setSystemSpeaking(true ),
            onDone:  ()  => setSystemSpeaking(false),
        });
        return () => ttsRef.current?.stop();
    }, []);
    
    // -------------------- Audio Streaming Wrapper -------------------------
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
        return () => audioStreamerRef.current?.stop();   // tidy up on unmount
    }, []);
 
    /* --------------------------------------------------------------------
        Start and Stop Recording Handlers
    -------------------------------------------------------------------- */
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
        ttsRef.current?.stop();     // just in case speech is still playing
    };

    /* --------------------------------------------------------------------
        Other Handlers
    -------------------------------------------------------------------- */
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

    // -------------------- UI ----------------------------------------------
    return (
        <> 
            <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? <BsStopCircle /> : <BsPlayCircle />}
            </Button>
        </>
    );
}
export default RecordButton;