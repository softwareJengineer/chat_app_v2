import React, { useContext, useState, useEffect } from "react"
import AuthContext from '../context/AuthContext';
import ChatSummary from "../components/ChatSummary"
import { getChats } from "../functions/apiRequests";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import dummyChats from "../data/dummyChats.json";
import blankChat from "../data/blankChat.json";

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
            <div className="float flex flex-row gap-4 m-[2rem]">
                <p className="text-5xl font-semibold">Chat History</p>
                <div className="float flex ml-auto gap-4">
                    <button className="text-gray-700 no-underline" onClick={() => toToday()}>Today's Speech Analysis</button>
                    <Link className="flex align-middle" style={{textDecoration: 'none'}} to='/history'>
                        <button className="text-blue-700 underline">Chat History</button>
                    </Link>
                    <Link className="flex align-middle" style={{textDecoration: 'none'}} to='/schedule'>
                        <button className="text-gray-700 no-underline">Schedule</button>
                    </Link>
                    <button className="flex bg-blue-700 rounded h-fit p-2 text-white self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                    Care Partner
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
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