import { useState, useContext                           } from "react";
import { Button, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { BsStopCircle                                   } from "react-icons/bs";
import { useNavigate, useLocation, Link                 } from "react-router-dom";

// Misc
import   AuthContext            from '../context/AuthContext';
import { createChat           } from "../functions/apiRequests";
import   dummyChats             from "../data/dummyChats.json";
import   calcAvgBiomarkerScores from "../functions/calcAvgBiomarkerScores";

// Components
import RecordButton from '../components/RecordButton';
import ChatHistory  from "../components/chat/ChatHistory";
import AvatarView   from "../components/chat/AvatarView";
import Avatar       from "../components/Avatar";
import Header       from '../components/Header';

// ====================================================================
// Chat.jsx
// ====================================================================
function Chat() {
    // Page setup
    const location = useLocation();
    const navigate = useNavigate();
    const {user, profile, goal, setGoal, authTokens, logoutUser} = useContext(AuthContext);
    
    // Conversation stuff
    const date = new Date();
    const [start,          setStart         ] = useState(null);
    const [viewMode,       setViewMode      ] = useState(4);

    // Attached to useSpeechEngine (could do all 3, but only recording implemented right now)
    const [recording,      setRecording     ] = useState(false);
    //const [systemSpeaking, setSystemSpeaking] = useState(false);
    //const [userSpeaking,   setUserSpeaking  ] = useState(false);

    // Initialize chat data (messages & biomarkers)
    const [messages,       setMessages      ] = useState(location.state ? location.state.messages : []);
    const [chatbotMessage, setChatbotMessage] = useState(`Hello, ${profile.plwdFirstName}! Press the Start button to begin chatting with me.`);
    const [biomarkerData,  setBiomarkerData ] = useState(location.state? location.state.biomarkerData : [
        {name: "Pragmatic",     data: []},
        {name: "Grammar",       data: []},
        {name: "Prosody",       data: []},
        {name: "Pronunciation", data: []},
        {name: "Anomia",        data: []},
        {name: "Turn Taking",   data: []},
    ]);


    // ... I don't really know whats going on here tbh
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
        let useMessages = (messages             .length === 0) ? dummyChats[0].messages : messages;
        if (messages.length === 0 || biomarkerData[0].data.length === 0) {setMessages(dummyChats[0].messages);}

        // Create data for a new chat entry in the database 
        let chatData = {user: user, date: end, scores: useScores, avgScores: calcAvgBiomarkerScores(useScores), notes: "", messages: useMessages, duration: duration}

        // Send the data for this chat to the database & navigate to the progress page when complete
        const response = await createChat(chatData, authTokens);
        if (response) {setGoal({...newGoal, current: goal.current + 1}); navigate('/progress');}
    }
    

    // ====================================================================
    // Main view for the page
    // ====================================================================
    function getView() {
        const chatHistoryWrapper1 = "flex flex-col justify-self-center mt-[1em] mb-[2rem] h-[65vh] w-full md:w-1/2 md:border-x-1 md:border-blue-200";
        const chatHistoryWrapper2 = "overflow-y-auto w-full md:w-1/2 h-1/2 md:h-full md:border-r-1 md:border-b-0 border-b-1 border-blue-200";

        // Chat history or Avatar views separately
        if      (viewMode == 1) {return (<div className={chatHistoryWrapper1}> <ChatHistory messages       = { messages       }/> </div>);}
        else if (viewMode == 3) {return (<div className="h-[65vh] mb-[2rem]">  <AvatarView  chatbotMessage = { chatbotMessage }/> </div>);}

        // Default / main view for the app -- keeping the other ones still though for debugging (want to be able to see the chat history)
        else if (viewMode == 4) {
            return (
                <div className="h-[65vh] mb-[2rem]">
                    <div className="my-[1rem] flex justify-center border-1 border-black p-[1em] rounded-lg mx-[25%]"> {chatbotMessage} </div>
                    <div className="h-full mt-[1em] w-full"> <Avatar /> </div>
                </div>
            );
        }

        // Combined split view
        else if (viewMode == 2) {
            return (
                <div className="flex md:flex-row flex-col h-[65vh] mt-[1em] w-full mb-[2rem]">
                    <div className={chatHistoryWrapper2}               > <ChatHistory messages       = { messages       }/> </div>
                    <div className="md:w-1/2 w-[100vw] md:h-full h-1/2"> <AvatarView  chatbotMessage = { chatbotMessage }/> </div>
                </div> 
                );
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
                    <Link className="plwd-link-inactive" to='/today'   > Review Today </Link>
                    <Link className="plwd-link-inactive" to='/history' > Chat History </Link>
                    <Link className="plwd-link-inactive" to='/schedule'> Schedule     </Link>
                    <button className="flex plwd-button-fill rounded h-fit p-2 self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>

            {/* Buttons to change the view mode for the page. (old) */}
            <div className="ml-[1rem] mt-[1rem] flex justify-center">
                <ToggleButtonGroup type="radio" name="viewMode" defaultValue={4}>
                    <ToggleButton id="messages"   variant="outline-primary" value={1} onChange={(e) => setViewMode(e.currentTarget.value)}> Messages           </ToggleButton>
                    <ToggleButton id="split"      variant="outline-primary" value={2} onChange={(e) => setViewMode(e.currentTarget.value)}> Messages & Chatbot </ToggleButton>
                    <ToggleButton id="avatar_old" variant="outline-primary" value={3} onChange={(e) => setViewMode(e.currentTarget.value)}> Chatbot (old)      </ToggleButton>
                    <ToggleButton id="avatar"     variant="outline-primary" value={4} onChange={(e) => setViewMode(e.currentTarget.value)}> Chatbot            </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* View of the chatHistory and/or Avatar */}
            {getView()}

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

                {/* Just a demo of how we could be attached to the recording flag from RecordButton (red dot indicator ?) */}
                {/* {recording && <div> <span className="dot"/> <p>test</p> </div> }*/}   

            </div>
            <SaveChatModal/>
        </>
    );
}

export default Chat;