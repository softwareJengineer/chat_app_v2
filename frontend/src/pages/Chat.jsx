import React, { useState, useEffect, useRef } from "react";
import Header from '../components/Header';
import ChatHistory from "../components/ChatHistory";
import Avatar from "../components/Avatar";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = "3249fb4e6d8248569b42d5dbf693c259";
const SPEECH_REGION = "eastus";
// Replace static wsUrl with dynamic version
const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8000/ws/chat/`
    : `ws://${window.location.hostname}/ws/chat/`;
// const wsUrl = "wss://dementia.ngrok.app";

const ws = new WebSocket(wsUrl);

function Chat() {
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const speechConfig = useRef(null);
    const audioConfig = useRef(null);
    const recognizer = useRef(null);
    const synthesizer = useRef(null);
    const [biomarkerData, setBiomarkerData] = useState({
        labels: [],
        datasets: [
            { label: 'Pragmatic', data: [], borderColor: 'red', fill: false },
            { label: 'Grammar', data: [], borderColor: 'blue', fill: false },
            { label: 'Turntaking', data: [], borderColor: 'green', fill: false },
            { label: 'Anomia', data: [], borderColor: 'yellow', fill: false },
            { label: 'Prosody', data: [], borderColor: 'purple', fill: false },
            { label: 'Pronunciation', data: [], borderColor: 'orange', fill: false }
        ]}
    )
    const [lastScores, setLastScores] = useState({});

    let audioContext, audioProcessor;

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
        if (response.type === 'llm_response') {
            if (!recording) return;
            addMessageToChat('AI', response.data);
            speakResponse(response.data);
        } else if (response.type === 'biomarker_scores') {
            updateChart(response.data);
        } else if (response.type === 'periodic_scores') {
            updatePeriodicScores(response.data);
        }
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        // setRecording(true);
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
                console.log(`Recognized: ${transcription}`);
                addMessageToChat('You', transcription);
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
        }
        return () => {
            recognizer.current.stopContinuousRecognitionAsync(() => {
                console.log('Speech recognition stopped.');
            });
            recognizer.current = undefined;
            audioConfig.current = undefined;
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

    async function initAudioProcessing() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new AudioContext({
                sampleRate: 16000
            });
            
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
                        if (ws && ws.readyState === WebSocket.OPEN) {
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
            source.connect(processorNode);
            processorNode.connect(audioContext.destination);
            
            // Store nodes for cleanup
            audioProcessor = processorNode;
            
            console.log(`Audio processing initialized with 0.5-second chunks at ${sampleRate}Hz`);
        } catch (error) {
            console.log(`Error initializing audio: ${error.message}`);
        }
    }

    function addMessageToChat(sender, message) {
        setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };

    function updateChart(newData) {
        if (!recording) return;

        if (newData) {
            setLastScores({ ...lastScores, ...newData });
        }

        const timestamp = biomarkerData.labels.length;
        biomarkerData.labels.push(timestamp);

        biomarkerData.datasets.forEach((dataset) => {
            const value = lastScores[dataset.label.toLowerCase()] || dataset.data[dataset.data.length - 1]?.y || 0;
            dataset.data.push({ x: timestamp, y: value });

            if (dataset.data.length > 60) {
                dataset.data.shift();
            }
        });

    }

    function updatePeriodicScores(scores) {
        if (!recording) return;

        setLastScores((prevScores) => ({ ...prevScores, ...scores }));
        updateChart();
    }

    return (
        <>
            <Header />
            <div className="flex h-[65vh] mt-[1em]">
                <ChatHistory messages={messages} />
                <Avatar />
            </div> 
            <button className="flex justify-center mx-auto items-center pb-[2em] pt-4"
                variant="outline-primary"
                onClick={() => setRecording(!recording) }>
                {recording ? <BsStopCircle size={50} color="red"/> : <BsPlayCircle size={50} color="lightskyblue"/>}
            </button>
        </>
    );
}

export default Chat;