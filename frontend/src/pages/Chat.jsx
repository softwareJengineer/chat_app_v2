import React, { useState, useEffect, useRef, useContext } from "react";
import { Button, ToggleButton, ToggleButtonGroup, Modal } from "react-bootstrap";

import { useNavigate, useLocation } from "react-router-dom";
import { UserContext              } from "../App";

import Header       from '../components/Header';
import RecordButton from '../components/RecordButton';
import ChatHistory  from "../components/chat/ChatHistory";
import AvatarView   from "../components/chat/AvatarView";

import calcAvgBiomarkerScores from "../functions/calcAvgBiomarkerScores";
import { createChat }         from "../functions/apiRequests";

import dummyChats from "../data/dummyChats.json";


function Chat() {
    const location = useLocation();
    const {user} = useContext(UserContext);

    const [messages,       setMessages      ] = useState(location.state ? location.state.messages : []);
    const [viewMode,       setViewMode      ] = useState(2);
    const [chatbotMessage, setChatbotMessage] = useState("Hello! I am here to assist you.");
    const [start,          setStart         ] = useState(null);

    // Passed to RecordButton
    const [recording, setRecording] = useState(false);

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

    // useEffect(() => {console.log(messages);}, [messages]);

    const [showModal, setShowModal] = useState(false);
    const handleShow  = () => setShowModal(true );
    const handleClose = () => setShowModal(false);


    // on message -> addMessageToChat('AI', response.data, response.time); setChatbotMessage(response.data);
    // scores     -> else if (response.type.includes("scores")) {updateScores(response);}
    /*
        
        console.log(`Recognized: ${transcription}`);
     
     
    */

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

    const saveChat = async () => {
        const end = new Date();
        const duration = Math.floor(((end - start) / 1000) / 60);

        //FOR TESTING
        if (messages.length === 0) {messages.state.message = dummyChats[0].messages;}

        const chatData = {
            user: user,
            date: end,
            scores: biomarkerData,
            avgScores: calcAvgBiomarkerScores(biomarkerData),
            notes: "",
            messages: messages,
            duration: duration
        }
        const response = await createChat(user, chatData);
        if (response) { navigate('/details', {state: {chatData: chatData}}); }
    }


    // ====================================================================
    // Main view for the page
    // ====================================================================
    function getView() {
        const chatHistoryWrapper1 = "flex flex-col justify-self-center mt-[1em] mb-[2rem] h-[65vh] w-full md:w-1/2 md:border-x-1 md:border-blue-200";
        const chatHistoryWrapper2 = "overflow-y-auto w-full md:w-1/2 h-1/2 md:h-full md:border-r-1 md:border-b-0 border-b-1 border-blue-200";

        // Chat history or Avatar views separately
        if      (viewMode == 1) {return (<div className={chatHistoryWrapper1}> <ChatHistory messages      ={ messages       }/> </div>);}
        else if (viewMode == 3) {return (<div className="h-[65vh] mb-[2rem]">  <AvatarView  chatbotMessage={ chatbotMessage }/> </div>);}
        
        // Combined split view
        else if (viewMode == 2) {
            return (
                <div className="flex md:flex-row flex-col h-[65vh] mt-[1em] w-full mb-[2rem]">
                    <div className={chatHistoryWrapper2}> <ChatHistory messages={messages}/> </div>
                    <div className="md:w-1/2 w-[100vw] md:h-full h-1/2"> <AvatarView chatbotMessage={ chatbotMessage }/> </div>
                </div> 
                );
        }
    }

    
    // --------------------------------------------------------------------
    // 
    // --------------------------------------------------------------------
    function CloseModal() {
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
            <Header title="Chat With Me!" page="chat"/>
            <div className="ml-[1rem] mt-[1rem] flex justify-center">
                <ToggleButtonGroup type="radio" name="viewMode" defaultValue={3}>
                    <ToggleButton id="messages" variant="outline-primary" value={1} onChange={(e) => setViewMode(e.currentTarget.value)}> Messages           </ToggleButton>
                    <ToggleButton id="split"    variant="outline-primary" value={2} onChange={(e) => setViewMode(e.currentTarget.value)}> Messages & Chatbot </ToggleButton>
                    <ToggleButton id="avatar"   variant="outline-primary" value={3} onChange={(e) => setViewMode(e.currentTarget.value)}> Chatbot            </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* View of the chatHistory and/or Avatar */}
            {getView()}
            
            {/* Buttons for starting/stopping the chat & saving the chat history */}
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                <RecordButton onRecordingChange = {setRecording}
                    onUserUtterance   = {(txt   ) => {addMessageToChat('You',    txt, getMessageTime());                        }}
                    onSystemUtterance = {(txt   ) => {addMessageToChat('System', txt, getMessageTime()); setChatbotMessage(txt);}} 
                    onScores          = {(scores) => {updateScores(scores);}}
                />
                <Button className="border-1 p-[1em] rounded-med" variant="outline-primary" size="lg" onClick={handleShow}> Finish </Button>

                {recording && <div> <span className="dot"/> <p>test</p> </div> }   {/* red dot indicator */}
            </div>
            <CloseModal/>
        </>
    );
}

export default Chat;