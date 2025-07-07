import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import Avatar from "../components/Avatar";
import { BsStopCircle, BsPlayCircle, BsPauseCircle } from "react-icons/bs";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthContext from '../context/AuthContext';
import calcAvgBiomarkerScores from "../functions/calcAvgBiomarkerScores";
import { createChat } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json";
import { marked } from 'https://esm.sh/marked'; // Markdown
import markedKatex from 'https://esm.sh/marked-katex-extension'; // LaTeX
import { GoogleGenAI, Modality } from 'https://esm.run/@google/genai';
import { Buffer } from 'buffer';
import { playL16Audio } from "../functions/audioFunctions";

const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8000/ws/chat/`
    : `ws://${window.location.hostname}/ws/chat/`;
// const wsUrl = "wss://dementia.ngrok.app";
const ws = new WebSocket(wsUrl);

function Chat() {
    const location = useLocation();
    const {user, profile, goal, setGoal, authTokens, logoutUser} = useContext(AuthContext);
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [messages, setMessages] = useState(location.state ? location.state.messages : []);
    // const [viewMode, setViewMode] = useState(3);
    const [chatbotMessage, setChatbotMessage] = useState("Hello, user. Press the Start button to begin chatting with me.");
    const [start, setStart] = useState(null);
    const [transcription, setTranscription] = useState("");
    const [utt, setUtt] = useState([]);
    const speechConfig = useRef(null);
    const audioConfig = useRef(null);
    const recognizer = useRef(null);
    const synthesizer = useRef(null);
    const audioProcessor = useRef(null);
    const stream = useRef(null);
    const source = useRef(null);
    const processorNode = useRef(null);
    const date = new Date();
    const navigate = useNavigate();
    const silenceTimeoutRef = useRef(null);
    const userSpeakingRef = useRef(false); // Mirror of state for logic inside callback

    const API_KEY = "AIzaSyA2l08-aWnXxS_ajb5nZCXDCJNzsN6BdSA";
    
    const MODEL_NAME = "gemini-2.0-flash-live-001"; // Realtime/Live model
    const TARGET_SAMPLE_RATE = 16000; // Gemini requires 16kHz audio
    const SYSTEM_PROMPT = 'Transcribe the audio input.'


    // --- State Variables ---
    const genAI = useRef(null);
    const liveSession = useRef(null);
    const mediaStream = useRef(null);
    const audioContext = useRef(null);
    const audioSource = useRef(null);
    const audioWorkletNode = useRef(null);
    const volumeWorkletNode = useRef(null);
    const [totalBytesSent, setTotalBytesSent] = useState(0);
    const [contextTurns, setContextTurns] = useState([])

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
            console.log(response);
            addMessageToChat('AI', response.data, response.time);
            setChatbotMessage(response.data);
            speakResponse(response.data);
        } else if (response.type.includes("scores")) {
            updateScores(response);
        }
    }

    function sendTranscriptionToServer(transcription) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'transcription', data: transcription }));
        }
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        if (!start) {
            setStart(new Date());
        }

        if (recording) {
           startStreaming();
        } else {
            stopStreaming();
        }
    }, [recording]);

    async function speakResponse(text) {
        console.log("Speaking response: ", text)
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: 'Say cheerfully: ' + text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        setSystemSpeaking(true);
        playL16Audio(data);
        setSystemSpeaking(false);
    }

    const AudioRecordingWorklet = `
            class AudioProcessingWorklet extends AudioWorkletProcessor {
                buffer = new Int16Array(2048);
                bufferWriteIndex = 0;

                constructor() {
                    super();
                }

                process(inputs, outputs, parameters) {
                    if (inputs.length > 0 && inputs[0].length > 0) {
                        const channelData = inputs[0][0];
                        this.processChunk(channelData);
                    }
                    return true; // Keep processor alive
                }

                sendAndClearBuffer() {
                    if (this.bufferWriteIndex > 0) {
                        const dataToSend = this.buffer.slice(0, this.bufferWriteIndex);
                        this.port.postMessage({
                            eventType: "audioData",
                            audioData: dataToSend.buffer // Send ArrayBuffer
                        }, [dataToSend.buffer]); // Transfer buffer ownership for efficiency
                        this.bufferWriteIndex = 0;
                    }
                }

                processChunk(float32Array) {
                    for (let i = 0; i < float32Array.length; i++) {
                        const clampedValue = Math.max(-1.0, Math.min(1.0, float32Array[i]));
                        const int16Value = Math.floor(clampedValue * 32767);
                        this.buffer[this.bufferWriteIndex++] = int16Value;
                        if (this.bufferWriteIndex >= this.buffer.length) {
                            this.sendAndClearBuffer();
                        }
                    }
                }
            }
            registerProcessor('audio-processing-worklet', AudioProcessingWorklet);
        `;

    const VolumeMeterWorklet = `
        class VolumeMeter extends AudioWorkletProcessor {
            constructor() {
                super();
                this.volume = 0;
            }
            
            process(inputs) {
                const input = inputs[0];
                if (input.length > 0 && input[0].length > 0) {
                    // Calculate RMS (Root Mean Square)
                    let sumOfSquares = 0.0;
                    for (const sample of input[0]) {
                        sumOfSquares += sample * sample;
                    }
                    const rms = Math.sqrt(sumOfSquares / input[0].length);
                    
                    // Convert RMS to a linear scale (0.0 to 1.0)
                    this.volume = Math.min(1.0, rms * 10); // Adjust multiplier as needed for sensitivity
                    // Post a message to main thread with the volume level
                    this.port.postMessage({ volume: this.volume });
                } else {
                    this.volume = 0;
                }
                
                return true;
            }
        }
        registerProcessor('volume-meter', VolumeMeter);
        `;

    function arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    useEffect(() => {
        if (utt.length === 0) return;
        if (!!utt[utt.length - 1].match(/.*[.:!?]$/) ) {
            const transcription = utt.join('');
            const date = new Date();
            const msgTime = date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
            console.log("Sending transcription to server: ", transcription);
            addMessageToChat('You', transcription, msgTime);
            sendTranscriptionToServer(transcription);
            setUtt([]);
        }
    }, [utt])

    async function startStreaming() {
        setRecording(true);
        try {
            // Step 1: Initialize GoogleGenAI Client
            genAI.current = new GoogleGenAI({ apiKey: API_KEY });
            try {
                const modelInfo = await genAI.current.models.get({ model: MODEL_NAME });
            } catch (testError) {
                console.log("error initializing googlegenai: ", testError)
                return;
            }

            // Step 2: Get Microphone Access
            mediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: TARGET_SAMPLE_RATE,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
                
            // Step 3: Create Audio Context and Source
            audioContext.current = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
            // Resume context if suspended (often needed after page load)
            if (audioContext.current.state === 'suspended') {
                await audioContext.current.resume();
            }
            audioSource.current = audioContext.current.createMediaStreamSource(mediaStream.current);
            // Create a gain node to split the audio signal
            const splitter = audioContext.current.createChannelSplitter(2);
            const merger = audioContext.current.createChannelMerger(2);
            const gainNode = audioContext.current.createGain();
            gainNode.gain.value = 1; // No gain change
               
            // Step 4: Set up Audio Worklet
            const workletBlob = new Blob([AudioRecordingWorklet], { type: 'application/javascript' });
            const workletURL = URL.createObjectURL(workletBlob);
            try {
                await audioContext.current.audioWorklet.addModule(workletURL);
            } catch (e) {
                console.log(`Error adding AudioWorklet module: ${e.message}. Make sure you are serving this page over HTTPS or localhost.`, 'error');
                throw e; // Re-throw to be caught by outer catch
            }
            audioWorkletNode.current = new AudioWorkletNode(audioContext.current, 'audio-processing-worklet');

            // Add the volume meter worklet
            const volumeWorkletBlob = new Blob([VolumeMeterWorklet], { type: 'application/javascript' });
            const volumeWorkletURL = URL.createObjectURL(volumeWorkletBlob);
            try {
                await audioContext.current.audioWorklet.addModule(volumeWorkletURL);
            } catch (e) {
                console.log(`Error adding VolumeMeter AudioWorklet module: ${e.message}. Make sure you are serving this page over HTTPS or localhost.`, 'error');
                throw e; // Re-throw to be caught by outer catch
            }
            volumeWorkletNode.current = new AudioWorkletNode(audioContext.current, 'volume-meter');

            // Connect audio nodes: Mic Source -> Gain Node -> Volume Worklet
            audioSource.current.connect(gainNode);
            gainNode.connect(volumeWorkletNode.current);
            
            //connect audio nodes: Gain Node -> split -> merge -> Gemini Worklet
            gainNode.connect(splitter);
            splitter.connect(merger, 0, 0); // Connect channel 0 to input 0
            splitter.connect(merger, 0, 1); // Connect channel 0 to input 1
            merger.connect(audioWorkletNode.current);

            volumeWorkletNode.current.connect(audioWorkletNode.current);
            
            // Step 5: Connect to Gemini Live API
            // Assign to liveSession *after* connection is successful
            const config = {
                responseModalities: [Modality.TEXT],
                speechConfig: { languageCode: "en-US" },
                inputAudioTranscription: {},
                maxOutputTokens: 1,
            };

            liveSession.current = await genAI.current.live.connect({
                model: MODEL_NAME,
                audioConfig: { targetSampleRate: TARGET_SAMPLE_RATE},
                config: config,
                callbacks: {
                    onopen: () => {
                        console.log("Connected to Gemini. Listening...", 'info');
                    },
                    onmessage: (message) => {
                        // Handle transcript text
                        if (message.serverContent && message.serverContent.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setUtt((prevUtt) => [...prevUtt, text]);
                        }

                        if (message.error) {
                            console.log(`Gemini Error: ${message.error.message || JSON.stringify(message.error)}`, 'error');
                        }
                    },
                    onerror: (errorEvent) => {
                        // Use errorEvent directly if it's an Error object, otherwise stringify
                        const errorMessage = errorEvent instanceof Error ? errorEvent.message : JSON.stringify(errorEvent);
                        console.log(`Gemini connection error: ${errorMessage}`, 'error');
                        stopStreaming(); // Stop on connection error
                    },
                    onclose: (closeEvent) => {
                        // Only call stopStreaming if the closure was unexpected while we were actively streaming
                            if (recording) {
                                console.log("Connection closed.");
                                stopStreaming();
                            }
                        },
                },
            });
            // send prior context if any
            if (contextTurns.length) {
                console.log(`Sending ${contextTurns.length} turns of prior context above.`);
                setContextTurns([...contextTurns, ({role: 'user', parts: [{text: "Please summarize our discussion so far."}]})]);
                await liveSession.current.sendClientContent({
                    turns: contextTurns,
                    turnComplete: true
                });
            }

            // Step 6: Handle Audio Data from Worklet
            audioWorkletNode.current.port.onmessage = (event) => {
                // Check if it's audio data, if the session exists, and if we are still streaming
                if (event.data.eventType === 'audioData' && liveSession.current && recording) {
                    const audioDataBuffer = event.data.audioData;
                    const base64AudioData = arrayBufferToBase64(audioDataBuffer);
                    
                    try {
                        // Send audio chunk to Gemini
                        liveSession.current.sendRealtimeInput({
                            media: {
                                data: base64AudioData,
                                mimeType: `audio/pcm;rate=${TARGET_SAMPLE_RATE}`
                            }
                        });
                        setTotalBytesSent(totalBytesSent + audioDataBuffer.byteLength);
                        if ((totalBytesSent - 4096) % 163840 === 0) { // every ~5 seconds
                            // console.log("Audio sent", totalBytesSent, "bytes,",
                            //     Math.round(totalBytesSent / 32000), "seconds");
                        }
                    } catch (sendError) {
                        console.log(`Error sending audio data: ${sendError.message}`, 'error');
                        // Optionally stop streaming if sending fails repeatedly
                        // stopStreaming();
                    }
                }
            };

            // Handle volume events
            volumeWorkletNode.current.port.onmessage = (event) => {
                // if (event.data.volume !== undefined) {
                //     console.log(event.data.volume);
                // }
            };

        } catch (error) {
            console.log(`Error starting stream: ${error.message || error}`, 'error');
            setRecording(false);
            await stopStreaming(); // Ensure cleanup happens even on startup error
        }

        return () => {
            stopStreaming();       
        };
    }

    async function stopStreaming() {
            // Prevent multiple stop calls overlapping
            if (!recording && !liveSession.current && !mediaStream.current && !audioContext) {
                console.log("Stop called but already stopped/cleaned up.");
                return;
            } 
            const wasStreaming = recording; // Keep track if we were actively streaming
            setRecording(false); // Set flag immediately to stop sending data

            // Step 7: Close Gemini Session
            if (liveSession.current) {
                try {
                    liveSession.current.close();
                } catch (e) {
                    console.log(`Error closing Gemini session: ${e.message}`, 'error');
                } finally {
                    liveSession.current = null;
                }
            }

            // Step 8: Stop Audio Processing
            if (audioWorkletNode.current) {
                audioWorkletNode.current.disconnect();
                audioWorkletNode.current = null;
            }
            // disconnect the volume meter node
            if (volumeWorkletNode.current) {
                volumeWorkletNode.current.disconnect();
                
                volumeWorkletNode.current = null;
                
            }
            if (audioSource.current) {
                audioSource.current.disconnect();
                audioSource.current = null;
            }            
            // Step 9: Stop Media Stream Tracks
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => track.stop());
                mediaStream.current = null;
            }
            // Step 10: Close Audio Context
            if (audioContext.current && audioContext.current.state !== 'closed') {
                try {
                    await audioContext.current.close();
                } catch (e) {
                    console.log(`Error closing AudioContext: ${e.message}`, 'error');
                } finally { audioContext.current = null;
                }
            }
        }
    
    function sendTranscriptionToServer(transcription) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'transcription', data: transcription }));
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

    const saveChat = async () => {
        setRecording(false);
        const end = new Date();
        const duration = Math.floor(((end - start) / 1000) / 60);

        //FOR TESTING
        var chatData = null;
        if (messages.length === 0 || biomarkerData[0].data.length === 0) {
            setMessages(dummyChats[0].messages);
                chatData = {
                user: user,
                date: end,
                scores: dummyChats[0].scores,
                avgScores: calcAvgBiomarkerScores(dummyChats[0].scores),
                notes: "",
                messages: dummyChats[0].messages,
                duration: duration
            }
        } else {
            chatData = {
                user: user,
                date: end,
                scores: biomarkerData,
                avgScores: calcAvgBiomarkerScores(biomarkerData),
                notes: "",
                messages: messages,
                duration: duration
            }
        }
        //END FOR TESTING

        //FOR DEPLOYMENT
        // const chatData = {
        //     user: user,
        //     date: end,
        //     scores: biomarkerData,
        //     avgScores: calcAvgBiomarkerScores(biomarkerData),
        //     notes: "",
        //     messages: messages,
        //     duration: duration
        // }
        //END FOR DEPLOYMENT

        const response = await createChat(chatData, authTokens);
        if (response) {
            setGoal({...newGoal, current: goal.current + 1})
            navigate('/progress');
        }
    }

    const [showModal, setShowModal] = useState(false);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    function CloseModal() {
        return (
            <Modal
                show={showModal}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to finish chatting? You will not be able to continue this chat.
                </Modal.Body>
                <Modal.Footer>
                <Button variant="outline-primary" onClick={handleClose}>
                    No
                </Button>
                <Button onClick={saveChat} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <>
            <div className="float flex flex-row gap-4 m-[2rem]">
                <p className="text-5xl font-semibold">Chat With Me</p>
                <div className="float flex ml-auto gap-4 items-center">
                    <Link className="plwd-link-inactive" to='/today'>
                        Review Today
                    </Link>
                    <Link className="plwd-link-inactive" to='/history'>
                        Chat History
                    </Link>
                    <Link className="plwd-link-inactive" to='/schedule'>
                        Schedule
                    </Link>
                    <button className="flex plwd-button-fill rounded h-fit p-2 self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>
            <div className="h-fit mb-[2rem]">
                <div className="my-[1rem] flex justify-center border-1 border-black p-[1em] rounded-lg mx-[25%] overflow-y-scroll h-[10vh]">
                    {chatbotMessage}
                </div>
                <div className="h-full mt-[1em] w-full">
                    <Avatar />
                </div>
            </div>
            <div className="flex flex-row justify-center my-[2em] gap-[4em] items-center">
                <button 
                    className="flex flex-col gap-2 items-center"
                    onClick={() => setRecording(!recording) }
                >
                    {recording ? 
                        <BsPauseCircle size={50} style={{color: "black"}}/> : 
                        <BsPlayCircle size={50} style={{color: "black"}}/>}
                    {recording ? "Pause Chat" : "Start Chat"}
                </button>
                <button className="flex flex-col gap-2 items-center"
                    onClick={handleShow}
                >
                    <BsStopCircle size={50} syle={{color: "black"}} />
                    End Chat
                </button>
            </div>
            <CloseModal/>
        </>
    );
}

export default Chat;