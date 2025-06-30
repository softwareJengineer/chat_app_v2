import { useRef, useEffect } from "react";

// ==================================================================== ==================================
// Handle the WebSocket Connection to the Backend
// ==================================================================== ==================================
// Open and close the websocket connection on change of the "recording" flag
// Receive things from the backend: LLM messages, Biomarker scores (sometimes)
export default function useBackendConnection({
    recording,
    onLLMResponse = () => {},
    onScores      = () => {},   // Biomarker scores
}) {
    // Backend WebSocket URL 
    const protocol = window.location.protocol === "https:"    ? "wss:"  : "ws:";
    const hostName = window.location.hostname === "localhost" ? ":8000" : ""   ;
    const wsUrl    = `${protocol}//${window.location.host}${hostName}/ws/chat/`;

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

    
    // Send helper
    const sendToServer = (payload) => {
        const ws = wsRef.current; 
        if (ws && ws.readyState === WebSocket.OPEN) {ws.send(JSON.stringify(payload));}
    };

    // Expose
    return {sendToServer};
}
