import React, { useContext, useState, useEffect } from "react"
import AuthContext from '../context/AuthContext';
//import ChatSummary from "../components/ChatSummary"
import { getChats } from "../functions/apiRequests";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import dummyChats from "../data/dummyChats.json";
import blankChat from "../data/blankChat.json";
import Header from "../components/Header";

function ChatHistory() {
    const {profile, authTokens} = useContext(AuthContext);
    const navigate = useNavigate();

    //FOR TESTING
    // const chats = dummyChats;
    //END FOR TESTING

    //FOR DEPLOYMENT
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(authTokens);
            setChats(userChats);
        };

        fetchChats();
    }, []);
    //END FOR DEPLOYMENT

    const toToday = () => {
        navigate('/today', {state: {chatData: chats[0]}})
    }

    return (
        <>
            <Header title="Chat History" page="history"/>
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50} color="purple" />
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                    Care Partner
                    <FaUser size={50} color="green" />
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
                </div>
                {profile.role == "Caregiver" ? 
                <Link to="/settings" className={"caregiver-link"}>
                    Update profile
                </Link> : null}
                
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