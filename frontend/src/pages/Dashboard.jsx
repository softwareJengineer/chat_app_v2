import React, { useContext, useEffect, useState } from "react"
import ChatSummary from "../components/ChatSummary"
import Header from "../components/Header";
import AuthContext from '../context/AuthContext';
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import { Button } from "react-bootstrap";
import { getChats } from "../functions/apiRequests";
import ScoreTrackGraph from "../components/ScoreTrackGraph";
import dummyChats from "../data/dummyChats.json";
import blankChat from "../data/blankChat.json";

function Dashboard() {
    const {profile, authTokens} = useContext(AuthContext);
    const [activeChart, setActiveChart] = useState("None");

    //FOR TESTING
    // const chats = dummyChats;
    // const chatData = dummyChats[0];
    //END FOR TESTING

    //FOR DEPLOYMENT
    const [chats, setChats] = useState([]);
    const [chatData, setChatData] = useState(blankChat);
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            const profileChats = await getChats(authTokens);
            setChats(profileChats);
            setChatData(profileChats.length > 0 ? profileChats[0] : blankChat);
            setScores(profileChats.length > 0 ? profileChats[0].scores : blankChat[0].scores);
        };

        fetchChats();
    }, []);
    //END FOR DEPLOYMENT

    const getStyle = (chart) => {
        if (activeChart === chart) {
            return "text-blue-600 underline hover:text-purple-900";
        } else {
            return "text-gray-400 hover:text-gray-600 hover:underline";
        }
    }

    const changeActive = (chart) => {
        setActiveChart(chart);
    }

    return (
        <>
            <Header title="Speech Analysis" page="dashboard" />
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
                    Care Partner
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                    <div className="flex float-right ml-auto">
                        <button
                            className="text-violet-600 border-1 border-violet-600 p-2 rounded hover:bg-violet-600 hover:text-white duration-200"
                        >
                            Download Report
                        </button>
                    </div>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="m-[2rem] rounded-lg border-1 border-gray-300 p-[1rem] grid md:grid-cols-2 grid-cols-1 gap-4 md:min-h-[40vh]">
                <div className="">
                    <span className="flex flex-row gap-4">
                        <b>Performance Track:</b>
                        <button className={getStyle("Overall")} onClick={() => changeActive("Overall")}>
                            Overall
                        </button>
                        <button className={getStyle("Biomarkers")} onClick={() => changeActive("Biomarkers")}>
                            Biomarkers
                        </button>
                    </span>
                    <br/>
                    <p>This will give an overview of {profile.plwdFirstName}'s performance over the past few weeks.</p>
                    <p>Here will be a summary of the days with big drops in performance.</p>
                    <p>Good days: A list of days with higher biomarker scores.</p>
                    <p>Bad days: A list of days with lower biomarker scores.</p>
                </div>
                <div className="md:h-full h-[40vh]">
                    {activeChart === "None" ? 
                        <p className="flex align-middle items-center h-full justify-center text-2xl">Select a chart to view</p> : 
                        activeChart === "Overall" ? 
                            <ScoreTrackGraph chats={chats} /> : 
                            <BiomarkerChart biomarkerData={scores} />}
                </div>
            </div>
            <div className="m-[2rem]">
                <h2>Chat History</h2>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                {chats.length > 0 ? chats.map((chat, index) => {
                    const prevChatData = index < chats.length-1 ? chats[index + 1] : null; // Get the previous chat if it exists
                    return (
                    <ChatSummary
                        key={index}
                        chatData={chat}
                        prevChatData={prevChatData}
                        chats={chats.length}
                    />
                    );
                }) : "No chats available."}
                </div>
            </div> 
        </>
    );
}

export default Dashboard;