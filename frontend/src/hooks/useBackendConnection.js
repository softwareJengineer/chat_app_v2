// src/hooks/useBackendConnection.js
import { useRef, useEffect } from 'react';

// ==================================================================== ==================================
// Handle the WebSocket Connection to the Backend
// ==================================================================== ==================================
// Open and close the websocket connection on change of the "recording" flag
export default function useBackendConnection({
    recording,
    onLLMResponse = () => {},
    onScores      = () => {},   // Biomarker scores
}) {
    // --------------------------------------------------------------------
    // Initial Setup 
    // --------------------------------------------------------------------
    // Backend WebSocket URL 
    // const wsUrl = "wss://dementia.ngrok.app";
    const wsUrl = window.location.hostname === 'localhost'
        ? `ws://${window.location.hostname}:8000/ws/chat/`
        : `ws://${window.location.hostname}/ws/chat/`;

    // Message reception helper
    const onMessage = (event) => {
        const { type, data } = JSON.parse(event.data); 
        if      (type === "llm_response"    ) {                                          onLLMResponse(data);     }
        else if (type === "biomarker_scores") {console.log("Biomarker scores received"); onScores({ type, data });} 
        else if (type === "periodic_scores" ) {console.log("Periodic scores received" ); onScores({ type, data });}
    };

    // --------------------------------------------------------------------
    // WebSocket Setup
    // --------------------------------------------------------------------
    const wsRef = useRef(null);
    useEffect(() => {
        if (!recording) {wsRef.current?.close(); return;}

        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen    = (     ) => {console.log  ("WebSocket connected to:",              wsUrl);};
        wsRef.current.onclose   = (event) => {console.log  ("WebSocket closed:",                    event);};
        wsRef.current.onerror   = (error) => {console.error("WebSocket connection failed, error:",  error);};
        wsRef.current.onmessage = (event) => {onMessage    (                                        event);};
        
        return () => wsRef.current?.close(); // (clean up on unmount)
    }, [recording]);

    // --------------------------------------------------------------------
    // Utility Functions
    // --------------------------------------------------------------------
    const sendToServer = (payload) => {const ws = wsRef.current; if (ws && ws.readyState === WebSocket.OPEN) {ws.send(JSON.stringify(payload));}};

    // Expose
    return {sendToServer};
}
