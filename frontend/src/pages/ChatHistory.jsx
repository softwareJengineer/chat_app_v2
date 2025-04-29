import React, { useContext, useState } from "react"
import { UserContext } from "../App";
import ChatSummary from "../components/ChatSummary"
import { getChats } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function ChatHistory() {
    const {user} = useContext(UserContext);

    //FOR TESTING
    const chats = dummyChats;
    //END FOR TESTING

    //FOR DEPLOYMENT
    // const [chats, setChats] = useState([]);
    // const [chatData, setChatData] = useState(blankChat);

    // useEffect(() => {
    //     const fetchChats = async () => {
    //         const userChats = await getChats(user);
    //         setChats(userChats);
    //         setChatData(chats.length > 0 ? userChats[0] : blankChat);
    //         console.log(userChats);
    //     };

    //     fetchChats();
    // }, []);

    return (
        <>
            <Header title="Chat History" page="history" />
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.caregiverFirstName} {user?.caregiverLastName}</p>
                    Care Partner
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.plwdFirstName} {user?.plwdLastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="m-[2rem]">
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                {chats.length > 0 ? chats.map((chat, index) => {
                    const prevChatData = index < chats.length-1 ? chats[index + 1] : null; // Get the previous chat if it exists
                    return (
                    <ChatSummary
                        chatData={chat}
                        prevChatData={prevChatData}
                        chats={chats.length}
                    />
                    );
                }) : "No chats available."}
                </div>
            </div> 
        </>
        
    )
    
}

export default ChatHistory;