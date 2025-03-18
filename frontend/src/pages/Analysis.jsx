import React, { useContext, useEffect, useState } from "react"
import ChatSummary from "../components/ChatSummary"
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import dummyData from "../data/dummyData.json";
import { Button, Form, Modal } from "react-bootstrap";
import { GoGear } from "react-icons/go";
import { getChats } from "../functions/apiRequests";

function Analysis() {
    const {user, setUser} = useContext(UserContext);
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(user);
            setChats(userChats);
        };

        fetchChats();
    }, []);

    return (
        <>
            <Header title="History and Trends" page="analysis" />
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.caregiverFirstName} {user?.caregiverLastName}</p>
                    Caring for 
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.plwdFirstName} {user?.plwdLastName}</p>
                    <div className="flex float-right ml-auto">
                        <Button variant="outline-primary">Download Report</Button>
                    </div>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
                <h2>Trends:</h2>
                <BiomarkerChart biomarkerData={dummyData}/>
                <h2>Chat History</h2>
                <div className="grid grid-cols-3 gap-2">
                {chats.map((chat, index) => {
                    const prevChatData = index > 0 ? chats[index - 1] : null; // Get the previous chat if it exists
                    return (
                    <ChatSummary
                        chatData={chat}
                        prevChatData={prevChatData}
                    />
                    );
                })}
                </div>
            </div>
        </>
    );
}

export default Analysis;