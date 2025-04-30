import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";

function RecordButton() {
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);

    let audioContext, audioProcessor;
    const subscriptionKey = "3249fb4e6d8248569b42d5dbf693c259";
    const serviceRegion = "eastus";
    // Replace static wsUrl with dynamic version
    const wsUrl = window.location.hostname === 'localhost' 
        ? `ws://${window.location.hostname}:8000/ws/chat/`
        : `ws://${window.location.hostname}/ws/chat/`;
    // const wsUrl = "wss://dementia.ngrok.app";

    let ws;


    // Loads the config
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer  = new SpeechSDK.SpeechRecognizer (speechConfig, audioConfig);
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
    

    /* ======================================================================= 
    ASR & kind of everything else...?
    ==========================================================================
    
    */
    const startRecording = () => {setRecording(true);

        if (recognizer) {
            recognizer.startContinuousRecognitionAsync();
            
            // Subscribe to the recognizing output
            recognizer.recognizing = (s, e) => {if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {setUserSpeaking(true); checkOverlap();}};

            // Utterance hhas been completed
            recognizer.recognized = (s, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    setUserSpeaking(false);

                    // Get the transcripted text and: 1) Log it; 2) Add it to the user chat; 3) Send it to the backend
                    const transcription = e.result.text;
                    console.log(`Recognized: ${transcription}`);
                    addMessageToChat('You', transcription);
                    sendTranscriptionToServer(transcription);
                }
            };
        } else {console.log("Recognizer not initialized");}



        // Handle the websocket connection
        ws = new WebSocket(wsUrl);
        ws.onopen    = (     ) => {console.log("WebSocket connected"            ); console.log  ("Connected to:",     wsUrl);};
        ws.onerror   = (error) => {console.log(`WebSocket connection failed`    ); console.error("WebSocket error:",  error);};
        ws.onclose   = (event) => {console.log(`WebSocket closed: ${event.code}`); console.log  ("WebSocket closed:", event);};
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'llm_response') {speakResponse(response.data);}
        };

        // Setup the audio streaming to the backend
        initAudioProcessing();
    }



    // Stop Recording
    const stopRecording = () => {
        setRecording(false);
        if (recognizer) {recognizer.stopContinuousRecognitionAsync();} 
        else            {console.log("Recognizer is already undefined or not initialized.");}
        audioConfig.close();
        if (ws) ws.close();
    }

    // Send text transcription to the backend (called earlier)
    function sendTranscriptionToServer(transcription) {
        if (ws && ws.readyState === WebSocket.OPEN) {s.send(JSON.stringify({ type: 'transcription', data: transcription }));}
    }

    function addMessageToChat(sender, message) {
        this.props.parentCallback([sender, message])
        // sendMessage([...messages, [sender, message]]);
        // const chatHistory = document.getElementById('chatHistory');
        // const messageElement = document.createElement('p');
        // messageElement.className = sender === 'You' ? 'message user-message' : 'message ai-message';
        // messageElement.textContent = `${sender}: ${message}`;
        // chatHistory.appendChild(messageElement);
        // chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    /* ======================================================================= 
    TTS Function
    ==========================================================================
    Main TTS function
    
    */
    function speakResponse(text) {
        setSystemSpeaking(true);
        synthesizer.speakTextAsync(
            text, 
            result => {if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {console.log("Speech synthesized"); setSystemSpeaking(false);}},
            error  => { console.log(`Error synthesizing speech: ${error}`); setSystemSpeaking(false);}
        );
    }



    // Utility to make sure we don't talk over the speaker 
    // (Make sure the user hasn't already begun speaking before the text response was received from the backend)
    function checkOverlap() {
        if (systemSpeaking && userSpeaking) {
            console.log("Overlapped speech detected!", true); ws.send(JSON.stringify({ type: 'overlapped_speech' }));
        }
    }

    /* ======================================================================= 
    Audio Handler
    ==========================================================================
    This records the incoming audio from the user and sends it to the backend in chunks.
    */
    async function initAudioProcessing() {
        try {
            // Start the audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new AudioContext({sampleRate: 16000});
            const source = audioContext.createMediaStreamSource(stream);
    
            // Create ScriptProcessor for direct audio processing
            const bufferSize = 4096;
            const processorNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
            
            // Buffer to accumulate smaller chunks of audio
            const sampleRate = audioContext.sampleRate;
            const chunkBufferSize = sampleRate * 5; 
            let audioBuffer = new Float32Array(chunkBufferSize);
            let bufferIndex = 0;
            
            // Helper function to convert array buffer to base64
            function arrayBufferToBase64(buffer) {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            }
            
            processorNode.onaudioprocess = (e) => {
                if (!recording) return;
                
                const input = e.inputBuffer.getChannelData(0);
                
                // Add input to buffer
                for (let i = 0; i < input.length && bufferIndex < chunkBufferSize; i++) { audioBuffer[bufferIndex++] = input[i];}
                
                // When we have enough audio data
                if (bufferIndex >= chunkBufferSize) {
                    try {
                        // Convert to 16-bit integers
                        const intData = new Int16Array(chunkBufferSize);
                        for (let i = 0; i < chunkBufferSize; i++) {
                            intData[i] = Math.max(-32768, Math.min(32767, Math.round(audioBuffer[i] * 32767)));
                        }
                        
                        // Convert to base64 directly from buffer
                        const base64Data = arrayBufferToBase64(intData.buffer);
                        
                        // Send to server
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            const timestamp = Date.now();
                            ws.send(JSON.stringify({
                                type:      'audio_data',
                                timestamp:  timestamp,
                                data:       base64Data,
                                sampleRate: sampleRate
                            }));
                            console.log(`Sent audio chunk at ${new Date(timestamp).toISOString()}, length: ${intData.length} samples`);
                        }
                    } catch (error) {console.log(`Error processing audio chunk: ${error.message}`);}
                    
                    // Reset buffer
                    bufferIndex = 0;
                    audioBuffer = new Float32Array(chunkBufferSize);
                }
            };
            
            // Connect the nodes
            source.connect(processorNode);
            processorNode.connect(audioContext.destination);
            
            // Store nodes for cleanup
            audioProcessor = processorNode;
            
            console.log(`Audio processing initialized with 0.5-second chunks at ${sampleRate}Hz`);
        } catch (error) {
            console.log(`Error initializing audio: ${error.message}`);
        }
    }

    return (
        <>
            <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? <BsStopCircle /> : <BsPlayCircle/>}
            </Button>
        </>
    )
}

export default RecordButton;