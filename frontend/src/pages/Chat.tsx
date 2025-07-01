import { useState, useContext                           } from "react";
import { Button, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { BsStopCircle                                   } from "react-icons/bs";
import { useNavigate, useLocation, Link                 } from "react-router-dom";

// Misc
import { createChat           } from "../functions/apiRequests";


import { useAuth } from "@/context/AuthProvider";



// Components
import LiveChatView  from "@/components/chats/LiveChatView";
import SaveChatModal from "@/components/modals/SaveChatModal";

import RecordButton from "@/components/RecordButton";

import useLiveChat from "@/hooks/useLiveChat";

/* 
Okay lets figure out what we need to happen here on this page

messages are sent and received
we have a function that we pass to the thing that receives messages for us
for now im just going to change it to console log the message, well i think it already does that actually




==================================================================== ==================================================================== 

    What do we do about receiving data? 



    We need it so we can render the chat, but we mostly actually just need the latest LLM message

move speech providers folder to utils
    fix the index in that folder

so id want state if i was rendering anything, like a recording flag/symbol or something

==================================================================== ====================================================================

We want to render data, there are three things that need to happen for this
* We know what the user is saying because of ASR, so we could use that
* We know what the LLM is saying because it gets sent to TTS - use this for the avatar view?
* We could try to access the most recent live chat object and show it
    - this would allow us to "monitor" conversations with the robot






*/

// ====================================================================
// Chat
// ====================================================================
export default function Chat() {
    // Setup
    const onUserUtterance   = (text: string) => {};
    const onSystemUtterance = (text: string) => {};
  

    // const { start, stop, save } = useLiveChat();
    
    // Separate recording flag that we control ourselves
    const [recording, setRecording ] = useState(false);
    // play, stop, save 

    // Modal control
    const [showModal, setShowModal] = useState(false);
    const saveChat = () => { setShowModal(false);  navigate("/dashboard"); }; // use the stop speaking callback




    // ====================================================================


    // Page setup
    const { user, profile, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    
    // Conversation stuff
    const date = new Date();
    const [start,          setStart         ] = useState(null);


 
 

    // Initialize chat data (messages & biomarkers)
    const [messages,       setMessages      ] = useState(location.state ? location.state.messages : []);
    const [chatbotMessage, setChatbotMessage] = useState(`Hello, ${profile.plwd.first_name}! Press the Start button to begin chatting with me.`);



    // ... I don't really know whats going on here tbh
    if (!start) { setStart(new Date()); }

    
    // ====================================================================
    // Functions
    // ====================================================================
    function getMessageTime() {const msgDate = new Date(); return msgDate.getUTCHours() + ':' + msgDate.getUTCMinutes() + ':' + msgDate.getUTCSeconds();}
    function addMessageToChat(sender, message, time) {setMessages((prevMessages) => [...prevMessages, { sender, message, time }]);};




    





    // ====================================================================
    // Final returned UI 
    // ====================================================================
    return (
        <>
            {/* View of the chatHistory and/or Avatar */}
            <LiveChatView messages={[]}/>
            

            {/* Buttons for starting/pausing the chat & saving the chat history/ending the chat */}
            <div className="flex flex-row justify-center mb-[2em] pt-[3em] gap-[4em] items-center">
                {/* Start/Pause the chat */}
                <RecordButton onRecordingChange = {setRecording}
                    onUserUtterance   = {(txt   ) => {addMessageToChat('You',    txt, getMessageTime());                        }}
                    onSystemUtterance = {(txt   ) => {addMessageToChat('System', txt, getMessageTime()); setChatbotMessage(txt);}} 
                    onScores          = {(scores) => {updateScores(scores);}}
                />

                {/* End/Save the chat */}
                <button className="flex flex-col gap-2 items-center" onClick={handleShow}>
                    <BsStopCircle size={50} syle={{color: "black"}} />
                    End Chat
                </button>

            </div>

            {/* SaveChatModal, controlled with props */}
            <SaveChatModal show={showModal} onClose={() => setShowModal(false)} saveChat={saveChat}/>

        </>
    );
}
