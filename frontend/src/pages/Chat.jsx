import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import ChatHistory from "../components/ChatHistory";
import Avatar from "../components/Avatar";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useNavigate, useLocation } from "react-router-dom";

const SPEECH_KEY = "3249fb4e6d8248569b42d5dbf693c259";
const SPEECH_REGION = "eastus";
const bufferSize = 4096;

// Replace static wsUrl with dynamic version
const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8000/ws/chat/`
    : `ws://${window.location.hostname}/ws/chat/`;
// const wsUrl = "wss://dementia.ngrok.app";

const ws = new WebSocket(wsUrl);

function Chat() {
    const location = useLocation();
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [messages, setMessages] = useState(location.state ? location.state.messages : []);
    const speechConfig = useRef(null);
    const audioConfig = useRef(null);
    const recognizer = useRef(null);
    const synthesizer = useRef(null);
    const audioContext = useRef(null);
    const audioProcessor = useRef(null);
    const stream = useRef(null);
    const source = useRef(null);
    const processorNode = useRef(null);
    
    const [biomarkerData, setBiomarkerData] = useState(location.state? location.state.biomarkerData : [
        {
            name: "Pragmatic",
            data: []
        },
        {
            name: "Grammar",
            data: []
        },
        {
            name: "Prosody",
            data: []
        },
        {
            name: "Pronunciation",
            data: []
        },
        {
            name: "Anomia",
            data: []
        },
        {
            name: "Turn Taking",
            data: []
        },
    ]);

    ws.onopen = () => {
        console.log("WebSocket connected to ", wsUrl);
    };

    ws.onerror = (error) => {
        console.log(`WebSocket connection failed`);
        console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code}`);
        console.log("WebSocket closed:", event);
    };

    ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (!recording) return;
        if (response.type === 'llm_response') {
            // console.log(response);
            addMessageToChat('AI', response.data, response.time);
            speakResponse(response.data);
        } else if (response.type.includes("scores")) {
            updateScores(response);
        }
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        speechConfig.current = SpeechSDK.SpeechConfig.fromSubscription(
            SPEECH_KEY,
            SPEECH_REGION
        );
        speechConfig.current.speechRecognitionLanguage = 'en-US';
    
        audioConfig.current = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        recognizer.current = new SpeechSDK.SpeechRecognizer(
            speechConfig.current,
            audioConfig.current
        );
        synthesizer.current = new SpeechSDK.SpeechSynthesizer(speechConfig.current);
    
        const processRecognizedTranscript = (event) => {
            const result = event.result;
            console.log('Recognition result:', result);
        
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                setUserSpeaking(false);
                const transcription = result.text;
                const date = new Date();
                const msgTime = date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
                console.log(`Recognized: ${transcription}`);
                addMessageToChat('You', transcription, msgTime);
                sendTranscriptionToServer(transcription);
            }
        };
    
        const processRecognizingTranscript = (event) =>{
            const result = event.result;
            // console.log('Recognition result:', result);
            if (result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
                setUserSpeaking(true);
                checkOverlap();
            }
        }
    
        recognizer.current.recognized = (s, e) => processRecognizedTranscript(e);
        recognizer.current.recognizing = (s, e) => processRecognizingTranscript(e);
    
        if (recording) {
            recognizer.current.startContinuousRecognitionAsync(() => {
                console.log('Speech recognition started.');
            });
            // initAudioProcessing();
            
        }
        
        return () => {
            recognizer.current.stopContinuousRecognitionAsync(() => {
                console.log('Speech recognition stopped.');
            });
            recognizer.current = undefined;
            audioConfig.current = undefined;
            audioProcessor.current = undefined;
            if (source.current && processorNode.current) {
                source.current.disconnect(processorNode.current);
                processorNode.current.disconnect(audioContext.current.destination);
            }             
        };
    }, [recording]);
    
    function sendTranscriptionToServer(transcription) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'transcription', data: transcription }));
        }
    }

    function speakResponse(text) {
        setSystemSpeaking(true);
        synthesizer.current.speakTextAsync(
            text, 
            result => {
                if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Speech synthesized");
                    setSystemSpeaking(false);
                }
            },
            error => {
                console.log(`Error synthesizing speech: ${error}`);
                setSystemSpeaking(false);
            }
        );
    }

    function checkOverlap() {
        if (systemSpeaking && userSpeaking) {
            console.log("Overlapped speech detected!", true);
            ws.send(JSON.stringify({ type: 'overlapped_speech' }));
        }
    }

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

    async function initAudioProcessing() {
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext.current = new AudioContext({
                sampleRate: 16000
            });
            
            source.current = audioContext.current.createMediaStreamSource(stream.current);
    
            // Create ScriptProcessor for direct audio processing
            processorNode.current = audioContext.current.createScriptProcessor(bufferSize, 1, 1);
            
            // Buffer to accumulate smaller chunks of audio
            const sampleRate = audioContext.current.sampleRate;
            const chunkBufferSize = sampleRate * 5; 
            let audioBuffer = new Float32Array(chunkBufferSize);
            let bufferIndex = 0;
            
            processorNode.current.onaudioprocess = (e) => {
                if (!recording) return;
                
                const input = e.inputBuffer.getChannelData(0);
                
                // Add input to buffer
                for (let i = 0; i < input.length && bufferIndex < chunkBufferSize; i++) {
                    audioBuffer[bufferIndex++] = input[i];
                }
                
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
                        if (ws && ws.readyState === WebSocket.OPEN && recording) {
                            const timestamp = Date.now();
                            ws.send(JSON.stringify({
                                type: 'audio_data',
                                timestamp: timestamp,
                                data: base64Data,
                                sampleRate: sampleRate
                            }));
                            console.log(`Sent audio chunk at ${new Date(timestamp).toISOString()}, length: ${intData.length} samples`);
                        }
                    } catch (error) {
                        console.log(`Error processing audio chunk: ${error.message}`);
                    }
                    
                    // Reset buffer
                    bufferIndex = 0;
                    audioBuffer = new Float32Array(chunkBufferSize);
                }
            };
            
            // Connect the nodes
            source.current.connect(processorNode.current);
            processorNode.current.connect(audioContext.current.destination);
            
            // Store nodes for cleanup
            audioProcessor.current = processorNode.current;
            
            console.log(`Audio processing initialized with 0.5-second chunks at ${sampleRate}Hz`);
        } catch (error) {
            console.log(`Error initializing audio: ${error.message}`);
        }
    }

    function updateScores(scores) {
        var prevData = biomarkerData;
        if (scores.type === "biomarker_scores") {
            prevData[0].data.push(scores.data["pragmatic"]);
            prevData[1].data.push(scores.data["grammar"]);
            prevData[2].data.push(scores.data["prosody"]);
            prevData[3].data.push(scores.data["pronunciation"]);
        } else if (scores.type === "periodic_scores") {
            if (prevData[0].data.length <= prevData[4].data.length) return;
            prevData[4].data.push(scores.data["anomia"]);
            prevData[5].data.push(scores.data["turntaking"]);
        }
        setBiomarkerData(prevData);
    }

    function addMessageToChat(sender, message, time) {
        setMessages((prevMessages) => [...prevMessages, { sender, message, time }]);
    };

    const navigate = useNavigate();

    const toNew = () => {
        setRecording(false);
        navigate('/details', {state: {biomarkerData: biomarkerData, messages: messages}});
    }

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
         window.addEventListener("resize", handleResizeWindow);
         return () => {
           window.removeEventListener("resize", handleResizeWindow);
         };
    }, []);

    return (
        <>
            <Header />
            <div className="flex md:flex-row flex-col h-[75vh] md:mt-[1em] my-[1em] w-[100vw]">
                <div className="md:w-1/2 md:border-r-1 md:border-blue-200 overflow-y-auto md:bg-white bg-blue-200 w-[100vw] md:h-full h-1/2">
                    <ChatHistory messages={messages} />
                </div>
                <div className="md:w-1/2 w-[100vw] md:h-full h-1/2">
                    <Avatar />
                </div>
            </div> 
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                <button
                    variant="outline-primary"
                    onClick={() => setRecording(!recording) }>
                    {recording ? 
                        <BsStopCircle size={50} style={{color: "red"}}/> : 
                        <BsPlayCircle size={50} style={{color: "lightskyblue"}}/>}
                </button>
                <Button
                    className="border-1 p-[1em] rounded-med"
                    variant="outline-primary"
                    size="lg"
                    onClick={() => toNew()}
                >
                    Finish
                </Button>
            </div>
        </>
    );
}

export default Chat;