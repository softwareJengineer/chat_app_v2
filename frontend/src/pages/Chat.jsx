import React, { useState, useEffect, useRef } from "react";
import { Button, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Header from '../components/Header';
import ChatHistory from "../components/ChatHistory";
import Avatar from "../components/Avatar";
import { BsStopCircle, BsPlayCircle } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";

const bufferSize = 4096;
const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8000/ws/chat/`
    : `ws://${window.location.hostname}/ws/chat/`;
const ws = new WebSocket(wsUrl);

function Chat() {
    const location = useLocation();
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [messages, setMessages] = useState(location.state ? location.state.messages : []);
    const [viewMode, setViewMode] = useState(3);
    const [chatbotMessage, setChatbotMessage] = useState("Hello! I am here to assist you.");
    const audioContext = useRef(null);
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
        if (audioContext.current && audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }
        if (response.type === 'transcription') {
            if (!recording) return;
            const transcription = response.data;
            const now = new Date();
            const msgTime = now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds();
            addMessageToChat('You', transcription, msgTime);
        } else if (response.type === 'llm_response') {
            addMessageToChat('AI', response.data, response.time);
            setChatbotMessage(response.data);
        } else if (response.type === 'tts_audio') {
            // Process and play TTS audio chunk
            console.log("Received TTS audio chunk");
            synthSpeech(response.data);
        } else if (response.type.includes("scores")) {
            updateScores(response);
        }
    };

    function synthSpeech(base64Data) {
        // Convert the base64 string to an ArrayBuffer
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Ensure an AudioContext exists and resume if it's suspended
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        } else if (audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }

        // Decode the audio data and play this chunk immediately
        audioContext.current.decodeAudioData(bytes.buffer)
        .then((decodedData) => {
            const source = audioContext.current.createBufferSource();
            source.buffer = decodedData;
            source.connect(audioContext.current.destination);
            source.start(0);
        })
        .catch((error) => {
            console.error("Error decoding audio data", error);
        });
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    // Frontend Transcription using the Web Speech API
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            console.error("Web Speech API is not supported by this browser.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = true; // Enable continuous listening

        recognition.onresult = (event) => {
            // Take the final result from the event
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setUserSpeaking(false);
            const date = new Date();
            const msgTime = date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
            console.log(`Recognized: ${transcript}`);
            addMessageToChat('You', transcript, msgTime);
            sendTranscriptionToServer(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
        };

        if (recording) {
            recognition.start();
            console.log('Speech recognition started.');
            // Optionally, initialize raw audio processing for biomarker analysis
            initAudioProcessing();
        } else {
            recognition.stop();
            console.log('Speech recognition stopped.');
        }

        return () => {
            recognition.abort();
        };
    }, [recording]);
    
    function sendTranscriptionToServer(transcription) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'transcription', data: transcription }));
        }
    }

    async function initAudioProcessing() {
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext.current = new AudioContext({ sampleRate: 16000 });
            source.current = audioContext.current.createMediaStreamSource(stream.current);
    
            // Create ScriptProcessor for direct audio processing
            processorNode.current = audioContext.current.createScriptProcessor(bufferSize, 1, 1);
            
            // Buffer to accumulate smaller chunks of audio
            const sampleRate = audioContext.current.sampleRate;
            const chunkBufferSize = sampleRate * 2.5; 
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
                            console.log(`Sent audio chunk at ${new Date(timestamp).toISOString()}, samples: ${intData.length}`);
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
            console.log(`Audio processing initialized with 5-second chunks at ${sampleRate} Hz`);
        } catch (error) {
            console.log(`Error initializing audio: ${error.message}`);
        }
    }

    // Helper function to convert array buffer to base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function updateScores(scores) {
        let prevData = [...biomarkerData];
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
    }

    const navigate = useNavigate();

    const toNew = () => {
        setRecording(false);
        navigate('/details', {state: {biomarkerData: biomarkerData, messages: messages}});
    };

    function getView() {
        if (viewMode == 1) {
            return (
                <div className="flex justify-self-center md:border-x-1 md:border-blue-200 mb-[2rem] flex-col h-[65vh] mt-[1em] md:w-1/2 w-full">
                    <ChatHistory messages={messages} />
                </div> 
            );
        } else if (viewMode == 2) {
            return (
                <div className="flex md:flex-row flex-col h-[65vh] mt-[1em] w-full mb-[2rem]">
                    <div className="md:w-1/2 md:border-r-1 border-blue-200 overflow-y-auto md:border-b-0 border-b-1 w-full md:h-full h-1/2">
                        <ChatHistory messages={messages} />
                    </div>
                    <div className="md:w-1/2 w-[100vw] md:h-full h-1/2">
                        <div className="my-[1rem] flex justify-center bg-blue-200 p-[1em] rounded-lg mx-[25%]">
                            {chatbotMessage}
                        </div>
                        <Avatar />
                    </div>
                </div> 
            );
        } else {
            return (
                <div className="h-[65vh] mb-[2rem]">
                    <div className="my-[1rem] flex justify-center bg-blue-200 p-[1em] rounded-lg mx-[25%]">
                        {chatbotMessage}
                    </div>
                    <div className="h-full mt-[1em] w-full">
                        <Avatar />
                    </div>
                </div>
            );
        }
    }

    return (
        <>
            <Header />
            <div className="ml-[1rem] mt-[1rem] flex justify-center">
                <ToggleButtonGroup type="radio" name="viewMode" defaultValue={3}>
                    <ToggleButton id="messages" variant="outline-primary" value={1} onChange={(e) => setViewMode(e.currentTarget.value)}>
                        Messages
                    </ToggleButton>
                    <ToggleButton id="split" variant="outline-primary" value={2} onChange={(e) => setViewMode(e.currentTarget.value)}>
                        Messages & Chatbot
                    </ToggleButton>
                    <ToggleButton id="avatar" variant="outline-primary" value={3} onChange={(e) => setViewMode(e.currentTarget.value)}>
                        Chatbot
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            {getView()}
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                <button variant="outline-primary" onClick={() => setRecording(!recording)}>
                    {recording ? 
                        <BsStopCircle size={50} style={{color: "red"}}/> : 
                        <BsPlayCircle size={50} style={{color: "lightskyblue"}}/>}
                </button>
                <Button className="border-1 p-[1em] rounded-med" variant="outline-primary" size="lg" onClick={() => toNew()}>
                    Finish
                </Button>
            </div>
        </>
    );
}

export default Chat;