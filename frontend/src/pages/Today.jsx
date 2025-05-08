import React, { useContext, useState } from "react"
import AuthContext from '../context/AuthContext';
import ChatSummary from "../components/ChatSummary"
import { getChats } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ChatLog from "../components/ChatLog";

function Today() {
    const {profile, authTokens, logoutUser} = useContext(AuthContext);
    const location = useLocation();
    const chatData = location.state.chatData;
    const navigate = useNavigate();

    const date = new Date(chatData.date);
    const style = new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })

    const toDetails = () => {
        navigate("/details", {state: {chatData: chatData}});
    }

    return (
        <>
            <div className="float flex flex-row gap-4 m-[2rem]">
                <button 
                    onClick={() => toDetails()} 
                    className="float flex mr-auto justify-middle text-black-500 border-1 align-middle rounded p-2 self-center"
                >
                        &#8592;
                </button>
                <p className="text-5xl font-semibold">Today's Speech Analysis</p>
                <div className="float flex ml-auto gap-4">
                    <button className="text-blue-700 underline">Today's Speech Analysis</button>
                    <Link className="flex align-middle" style={{textDecoration: 'none'}} to='/history'>
                        <button className="text-gray-700 no-underline">Chat History</button>
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
                </div>
            </div>
            <div className="m-[2rem] flex flex-col gap-4">
                <span className="flex flex-row gap-5">
                    <p className="text-3xl font-semibold">Conclusion of the Speech</p>
                    <p className="flex align-middle justify-center font-black text-3xl">{style.format(date)}</p>
                </span>
                <p>Here would be a summary of today's conversation. It would include topics talked about, sentiment of the conversation, and more.</p>
                <p className="text-3xl font-semibold">Conversation Analysis</p>
                <p>Here would be an analysis of today's speech and how well you are doing in several biomarkers. For example, if you were doing
                    very well in turn taking, we would give praise. If you had a biomarker to work on, we would give suggestions on how to improve.
                </p>
                <p className="text-3xl font-semibold">How to Keep It Up</p>
                <p>Here would be some suggestions of activities to keep healthy and active. For example, spending time outdoors, connecting
                    with friends, etc.
                </p>
            </div>
</>
    )
}

export default Today;