import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Avatar from "../components/Avatar";
import { BsStopCircle, BsPlayCircle, BsPauseCircle } from "react-icons/bs";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthContext from '../context/AuthContext';
import calcAvgBiomarkerScores from "../functions/calcAvgBiomarkerScores";
import { createChat } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json";
import { useNavigate, useLocation, Link                 } from "react-router-dom";

import AuthContext  from '../context/AuthContext';
import Header       from '../components/Header';
import RecordButton from '../components/RecordButton';
import ChatHistory  from "../components/chat/ChatHistory";
import AvatarView   from "../components/chat/AvatarView";

import calcAvgBiomarkerScores from "../functions/calcAvgBiomarkerScores";
import { createChat }         from "../functions/apiRequests";

import dummyChats from "../data/dummyChats.json";


function Chat() {
    const location = useLocation();
    const {user, profile, goal, setGoal, authTokens, logoutUser} = useContext(AuthContext);
    const [recording, setRecording] = useState(false);
    const [systemSpeaking, setSystemSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [messages, setMessages] = useState(location.state ? location.state.messages : []);
    // const [viewMode, setViewMode] = useState(3);
    const [chatbotMessage, setChatbotMessage] = useState("Hello, " + profile.plwdFirstName + ". Press the Start button to begin chatting with me.");
    const [start, setStart] = useState(null);
    const speechConfig = useRef(null);
    const audioConfig = useRef(null);
    const recognizer = useRef(null);
    const synthesizer = useRef(null);
    const audioContext = useRef(null);
    const audioProcessor = useRef(null);
    const stream = useRef(null);
    const source = useRef(null);
    const processorNode = useRef(null);

    const date = new Date();
    const navigate = useNavigate();

    const [biomarkerData, setBiomarkerData] = useState(location.state? location.state.biomarkerData : [
        {name: "Pragmatic",     data: []},
        {name: "Grammar",       data: []},
        {name: "Prosody",       data: []},
        {name: "Pronunciation", data: []},
        {name: "Anomia",        data: []},
        {name: "Turn Taking",   data: []},
    ]);

  


    // on message -> addMessageToChat('AI', response.data, response.time); setChatbotMessage(response.data);
    // scores     -> else if (response.type.includes("scores")) {updateScores(response);}

    if (!start) { setStart(new Date()); }
    


    
    // ====================================================================
    // Functions
    // ====================================================================
    function getMessageTime() {const msgDate = new Date(); return msgDate.getUTCHours() + ':' + msgDate.getUTCMinutes() + ':' + msgDate.getUTCSeconds();}

    function addMessageToChat(sender, message, time) {setMessages((prevMessages) => [...prevMessages, { sender, message, time }]);};

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
    };

    // --------------------------------------------------------------------
    // Save this chat to the database & navigate to the progress page
    // --------------------------------------------------------------------
    const saveChat = async () => {
        // Get the final duration of the chat
        const end      = new Date();
        const duration = Math.floor(((end - start) / 1_000) / 60);

        //FOR TESTING
        let useScores   = (biomarkerData[0].data.length === 0) ? dummyChats[0].scores   : biomarkerData;
        let useMessages = (messages.length === 0) ? dummyChats[0].messages : messages;
        if (messages.length === 0 || biomarkerData[0].data.length === 0) {setMessages(dummyChats[0].messages);}

        // Create data for a new chat entry in the database 
        let chatData = {user: user, date: end, scores: useScores, avgScores: calcAvgBiomarkerScores(useScores), notes: "", messages: useMessages, duration: duration}

        // Send the data for this chat to the database & navigate to the progress page when complete
        const response = await createChat(chatData, authTokens);
        if (response) {
            setGoal({...newGoal, current: goal.current + 1})
            navigate('/progress');
        }
    }
    
    // ====================================================================
    // Modal (should move this to another file)
    // ====================================================================
    // Handlers
    const [showModal, setShowModal] = useState(false);
    const handleShow  = () => setShowModal(true );
    const handleClose = () => setShowModal(false);

    function SaveChatModal() {
        return (
            <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} centered >

                <Modal.Header closeButton> <Modal.Title>Unsaved Changes</Modal.Title> </Modal.Header>
                <Modal.Body> Are you sure you want to finish chatting? You will not be able to continue this chat.</Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} variant="outline-primary" > No  </Button>
                    <Button onClick={saveChat   } variant="danger"          > Yes </Button>
                </Modal.Footer>

            </Modal>
        )
    }


    // ====================================================================
    // Final returned UI 
    // ====================================================================
    return (
        <>
            {/* <Header title="Chat With Me!" page="chat"/> */}
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
            
            {/* Buttons for starting/stopping the chat & saving the chat history */}
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                <RecordButton onRecordingChange = {setRecording}
                    onUserUtterance   = {(txt   ) => {addMessageToChat('You',    txt, getMessageTime());                        }}
                    onSystemUtterance = {(txt   ) => {addMessageToChat('System', txt, getMessageTime()); setChatbotMessage(txt);}} 
                    onScores          = {(scores) => {updateScores(scores);}}
                />
                <button className="flex flex-col gap-2 items-center"
                    onClick={handleShow}
                >
                    <BsStopCircle size={50} syle={{color: "black"}} />
                    End Chat
                </button>

                {recording && <div> <span className="dot"/> <p>test</p> </div> }   {/* red dot indicator */}
            </div>
            <SaveChatModal/>
        </>
    );
}

export default Chat;