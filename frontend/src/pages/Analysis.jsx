import React, { useContext, useEffect, useState } from "react"
import ChatSummary from "../components/ChatSummary"
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import dummyData from "../data/dummyData.json";
import { Button } from "react-bootstrap";
import { getChats } from "../functions/apiRequests";
import ScoreTrackGraph from "../components/ScoreTrackGraph";
import dummyChats from "../data/dummyChats.json";
import daysInARow from "../functions/daysInARow";
import ScoreRadarChart from "../components/ScoreRadarChart";
import Avatar from "../components/Avatar";

function Analysis() {
    const {user} = useContext(UserContext);
    const [chats, setChats] = useState(dummyChats);
    const [chatData, setChatData] = useState(null);
    const [prevChatData, setPrevChatData] = useState(null);
    const date = new Date();

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(user);
            setChats(userChats);
            setChatData(userChats[0]);
            setPrevChatData((chats.length > 1 ? userChats[1] : null));
        };

        fetchChats();
    }, []);

    const calcGoal = (chats) => {
        const goal = chats % 5;
        return 5 - goal;
    }

    return (
        <>
            <Header title="Dementia Speech Analysis" page="analysis" />
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
            </div>
            <div className="flex mx-[2rem]">
                <h2>Daily Overview:</h2>
                <p className="flex float-right ml-auto text-xl">{date.toDateString()}</p>
            </div>
                <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch mx-[2rem] items-center gap-4">
                    <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                        <h3>Conclusions and Suggestions</h3>
                        <div className="flex flex-row gap-4 my-[1rem]">
                            <div className="w-1/3">
                                <Avatar />
                            </div>
                            <div className="w-2/3">
                                <p className="font-bold">{user.plwdFirstName} is doing fantastic!</p>
                                <p>{user.plwdFirstName} has talked to me for {daysInARow(chats)} in a row.</p>
                                <p>{user.plwdFirstName} has completed {chats.length} {chats.length === 1 ? "chat" : "chats"} with me.</p>
                                <p>{user.plwdFirstName} can complete another {calcGoal(chats.length)} to reach a new goal!</p>
                                <Link to='/schedule'>
                                    <Button variant="outline-primary">Schedule a chat</Button>
                                </Link>
                            </div>
                        </div>
                        <p className="font-bold">Daily suggestions:</p>
                        <p>Have {user.plwdFirstName} play a word game with me!</p>
                        <p>Go outside and enjoy the greenery and fresh air.</p>
                    </div>
                    <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                        <h3>Radar Track</h3>
                        <ScoreRadarChart biomarkerData={chatData.scores} prevBiomarkerData={prevChatData.scores}/>
                        <br/>
                        Based on these scores, I suggest the following activities:
                        <div className="flex flex-row gap-4 m-[1rem]">
                            <div className="w-1/2 border-1 rounded-md border-gray-200 p-[1rem]">
                                <h4>Mad Libs</h4>
                            </div>
                            <div className="w-1/2 border-1 rounded-md border-gray-200 p-[1rem]">
                                <h4>Word Matching</h4>
                            </div>  
                        </div>
                    </div>
                </div>
                <div className="m-[2rem]">
                    <h2>Trends:</h2>
                    <h4>Overall Score Track:</h4>
                    <ScoreTrackGraph chats={chats} />
                    <h4>Biomarker Track:</h4>
                    <BiomarkerChart biomarkerData={dummyData}/>
                    <h2>Chat History</h2>
                    <div className="grid grid-cols-3 gap-2">
                    {chats.map((chat, index) => {
                        const prevChatData = index < chats.length-1 ? chats[index + 1] : null; // Get the previous chat if it exists
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