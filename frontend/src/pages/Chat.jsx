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

const bufferSize = 4096;

// Replace static wsUrl with dynamic version
const wsUrl = window.location.hostname === 'localhost' 
    ? `ws://${window.location.hostname}:8000/ws/chat/`
    : `ws://${window.location.hostname}/ws/chat/`;
// const wsUrl = "wss://dementia.ngrok.app";

const ws = new WebSocket(wsUrl);

function Chat() {
    const location = useLocation();
    const {user, profile, goal, setGoal, authTokens, logoutUser} = useContext(AuthContext);
    const [recording, setRecording] = useState(false);
    const [messages, setMessages] = useState(location.state ? location.state.messages : []);
    // const [viewMode, setViewMode] = useState(3);
    const [chatbotMessage, setChatbotMessage] = useState("Hello. Press the Start button to begin chatting with me.");
    const [start, setStart] = useState(null);
    const audioContext = useRef(null);
    const audioProcessor = useRef(null);
    const stream = useRef(null);
    const source = useRef(null);
    const processorNode = useRef(null);
    const navigate = useNavigate();

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
            setChatbotMessage(response.data);
            speakResponse(response.data);
        } else if (response.type.includes("scores")) {
            updateScores(response);
        }
    }

    useEffect(() => {
        console.log(messages);
    }, [messages]);

    useEffect(() => {
        if (!start) {
            setStart(new Date());
        }
        initAudioProcessing();
    }, [recording]);

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
            <div className="h-[65vh] mb-[2rem]">
                <div className="my-[1rem] flex justify-center border-1 border-black p-[1em] rounded-lg mx-[25%]">
                    {chatbotMessage}
                </div>
                <div className="h-full mt-[1em] w-full">
                    <Avatar />
                </div>
            </div>
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                <button 
                    className="flex flex-col gap-2 items-center"
                    onClick={() => {setRecording(!recording)} }
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