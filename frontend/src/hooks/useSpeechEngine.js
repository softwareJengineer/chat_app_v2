// src/hooks/useSpeechEngine.js
import { useRef, useState, useEffect } from 'react';

import { Providers } from '../speechProviders';
import AudioStreamer from '../utils/AudioStreamer'; // --- needs to be updated to have 2 simultaneous buffers for Gemini ---
import toBase64      from '../utils/toBase64';

// ====================================================================
// Speech Engine Hook
// ====================================================================
export default function useSpeechEngine({
    onUserUtterance,                // (required) "You" message handler
    onSystemUtterance = () => {},   // Fires before TTS
    onScores          = () => {},   // Biomarker scores, etc.
    onOverlap         = () => {},   // overlapped-speech flag
  }) {
    // --------------------------------------------------------------------
    // Set up provider (env var or literal) & WebSocket URL
    // --------------------------------------------------------------------
    //const PROVIDER = process.env.REACT_APP_SPEECH_PROVIDER || 'test';  // 'azure' | 'gemini' | 'test'
    const PROVIDER = import.meta.env.VITE_SPEECH_PROVIDER || 'test';
    const { ASR: ASRClass, TTS: TTSClass } = Providers[PROVIDER];

    const wsUrl = window.location.hostname === 'localhost'
        ? `ws://${window.location.hostname}:8000/ws/chat/`
        : `ws://${window.location.hostname}/ws/chat/`;
    // const wsUrl = "wss://dementia.ngrok.app";

    // --------------------------------------------------------------------
    // States and References
    // --------------------------------------------------------------------
    const [recording,      setRecording     ] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking,   setUserSpeaking  ] = useState(false);

    // WebSocket, ASR, TTS, & AudioStreamer
    const wsRef    = useRef(null);
    const asrRef   = useRef(null);
    const ttsRef   = useRef(null);
    const audioRef = useRef(null);       

    // Keep the latest flags for overlap detection
    const systemSpeakingRef = useRef(false);
    const userSpeakingRef   = useRef(false);
    useEffect(() => {systemSpeakingRef.current = systemSpeaking;}, [systemSpeaking]);
    useEffect(() => {  userSpeakingRef.current =   userSpeaking;}, [  userSpeaking]);

    // --------------------------------------------------------------------
    // Timing
    // --------------------------------------------------------------------
    //const ttsStartRef = useRef(0);

    // --------------------------------------------------------------------
    // WebSocket Setup
    // --------------------------------------------------------------------
    // Open and close the websocket connection on change of the 'recording' variable
    useEffect(() => {
        if (!recording) {wsRef.current?.close(); return;}

        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen    = (     ) => {console.log  ("WebSocket connected to:",              wsUrl);};
        wsRef.current.onclose   = (event) => {console.log  ("WebSocket closed:",                    event);};
        wsRef.current.onerror   = (error) => {console.error("WebSocket connection failed, error:",  error);};
        wsRef.current.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data); 
            if      (type === 'llm_response'    ) {console.log("LLM Response:",       data); onSystemUtterance(data); speakResponse(data);}
            else if (type === 'biomarker_scores') {console.log("Biomarker scores received"); onScores({ type, data });} 
            else if (type === 'periodic_scores' ) {console.log("Periodic scores received" ); onScores({ type, data });}
        };
        return () => wsRef.current?.close();
      }, [recording]);

    // --------------------------------------------------------------------
    // Instantiate ASR
    // --------------------------------------------------------------------
    useEffect(() => {
        asrRef.current = new ASRClass({
            onUtterance          : handleUtterance,
            onUserSpeakingChange : setUserSpeaking,
            onUserSpeakingStart  : checkOverlap
        });
        return () => asrRef.current?.stop_stream();
    }, []);

    // --------------------------------------------------------------------
    // Instantiate TTS
    // --------------------------------------------------------------------
    useEffect(() => {
        ttsRef.current = new TTSClass({
            onStart : ()  => setSystemSpeaking(true ),
            onDone  : ()  => setSystemSpeaking(false),
        });
        return () => ttsRef.current?.stop();
    }, []);
    
    // --------------------------------------------------------------------
    //  Audio Streaming Wrapper
    // --------------------------------------------------------------------
    useEffect(() => {
        audioRef.current = new AudioStreamer({
            sampleRate : 16_000,
            chunkMs    :  5_000,
            onChunk    : (int16, timestamp) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    const base64 = toBase64(int16);
                    wsRef.current?.send(JSON.stringify({
                        type      : 'audio_data',
                        timestamp : timestamp,
                        data      : base64,
                        sampleRate: 16_000,
                    }));
                }
            },
            onError    : err => console.error('Audio error:', err)
        });
        return () => audioRef.current?.stop(); // (clean up on unmount)
    }, []);
 
    // --------------------------------------------------------------------
    // Start & Stop Recording
    // --------------------------------------------------------------------
    const startRecording = () => {
        // Set the recording variable to true and start streaming for the ASR object
        setRecording(true); 
        asrRef.current.start_stream();
        audioRef.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        asrRef.current.stop_stream();
        audioRef.current?.stop();
        wsRef.current?.close();
        ttsRef.current?.stop();  // (just in case speech is still playing)
    };

    // --------------------------------------------------------------------
    // Other Handlers
    // --------------------------------------------------------------------
    function handleUtterance (text) {console.log('Recognized:', text); onUserUtterance(text); sendToServer({ type: 'transcription', data: text });}
    function speakResponse   (text           ) {ttsRef.current?.speak(text);}
    function sendToServer    (payload        ) {const ws = wsRef.current; if (ws && ws.readyState === WebSocket.OPEN) {ws.send(JSON.stringify(payload));}}
    function checkOverlap() {
        if (systemSpeakingRef.current && userSpeakingRef.current) {
            console.log('Overlapped speech detected');
            sendToServer({ type: 'overlapped_speech' });
        }
    }

    // Expose (maybe in the future expose userSpeaking and systemSpeaking as well)
    return { recording, startRecording, stopRecording }; 
}




