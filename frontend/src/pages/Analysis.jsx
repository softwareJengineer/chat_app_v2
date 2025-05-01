import React, { useContext, useState } from "react"
import AuthContext from '../context/AuthContext';
import ChatSummary from "../components/ChatSummary"
import { getChats } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import ChatLog from "../components/ChatLog";

function Analysis() {
    const {user} = useContext(AuthContext);
    const location = useLocation();
    const chatData = location.state.chatData;
    const prevChatData = location.state.prevChatData;
    const biomarker = location.state.biomarker;

    return (
        <>
            <Header title="Transcript Analysis" page="analysis" />
            <div className="m-[2rem]">
                <ChatLog messages={chatData.messages} firstName={user.plwdFirstName} lastName={user.plwdLastName} date={chatData.date}/>
            </div>
        </>
    )
}

export default Analysis;