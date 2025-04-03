import React, { useContext, useState, useEffect } from "react";
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

function ChatDetails() {
    const { user } = useContext(UserContext);
    const location = useLocation();
    const chatData = location.state?.chatData;
    const prevChatData = location.state?.prevChatData;
    const date = new Date(chatData.date);

    return (
        <>
            <Header title="Single Chat Analysis" page="chatdetails" />
            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.plwdFirstName} {user?.plwdLastName}</p>
                    Cared for by 
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.caregiverFirstName} {user?.caregiverLastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="flex m-[2rem]">
                <h2>{date.toDateString()}</h2>
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 h-full justify-stretch m-[2rem] items-center gap-4">
                <div className="border-1 border-gray-300 rounded-lg p-[2rem] hover:shadow-xl h-full">
                    <h4>Daily Topics</h4>
                </div>
                <div className="border-1 border-gray-300 rounded-lg p-[2rem] hover:shadow-xl h-full">
                    <h4>Mood Track</h4>
                    <p>You felt </p>
                    <p>Because </p>
                </div>
                <div className="border-1 border-gray-300 rounded-lg p-[2rem] hover:shadow-xl h-full">
                    <h4>Pragmatic Review</h4>
                </div>
            </div>
        </>
    )
}

export default ChatDetails;