import React, { useContext, useEffect, useState } from "react"
import ChatSummary from "../components/ChatSummary"
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import { Button } from "react-bootstrap";
import { getChats } from "../functions/apiRequests";
import ScoreTrackGraph from "../components/ScoreTrackGraph";
import dummyChats from "../data/dummyChats.json";
import blankChat from "../data/blankChat.json";
import daysInARow from "../functions/daysInARow";
import ScoreRadarChart from "../components/ScoreRadarChart";
import Avatar from "../components/Avatar";
import GoalProgress from "../components/GoalProgress";
import { GiAlarmClock, GiPartyPopper, GiRobotAntennas } from "react-icons/gi";
import { getExercises } from "../functions/getExercises";

function Dashboard() {
    const {user} = useContext(UserContext);

    //FOR TESTING
    // const [chats, setChats] = useState(dummyChats);
    // const [chatData, setChatData] = useState(dummyChats[0]);
    // const [prevChatData, setPrevChatData] = useState(dummyChats[1]);

    //FOR DEPLOYMENT
    const date = new Date();
    const [chats, setChats] = useState([]);
    const [chatData, setChatData] = useState(blankChat);
    const [prevChatData, setPrevChatData] = useState(blankChat);

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(user);
            setChats(userChats);
            setChatData(chats.length > 0 ? userChats[0] : blankChat);
            setPrevChatData((chats.length > 1 ? userChats[1] : blankChat));
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
                    Care Partner
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
                <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch mx-[2rem] items-center gap-4 mb-[2rem]">
                    <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                        <h3>Conclusions and Suggestions</h3>
                        <div className="flex flex-row gap-4 my-[1rem]">
                            <div className="w-1/3">
                                <Avatar />
                            </div>
                            <div className="w-2/3">
                                <p className="font-bold text-2xl">
                                    {user.plwdFirstName} is doing fantastic!
                                </p>
                                <GoalProgress current={chats.length}/>
                                <p className="flex flex-row items-center gap-4 text-xl">
                                    <GiPartyPopper size={40} color="orange" /> 
                                    <span>
                                        {user.plwdFirstName} has talked to me for 
                                        <b className="text-amber-500 text-2xl"> {daysInARow(chats)} </b> 
                                        in a row.
                                    </span>
                                </p>
                                <p className="flex flex-row items-center gap-4 text-xl">
                                    <GiAlarmClock size={40} color="green" /> 
                                    <span>
                                        {user.plwdFirstName} has completed 
                                        <b className="text-green-700 text-2xl"> {chats.length} {chats.length === 1 ? "chat" : "chats"} </b> 
                                        with me.
                                    </span>
                                </p>
                                <p className="flex flex-row items-center gap-4 text-xl">
                                    <GiRobotAntennas size={40} color="purple" />
                                    <span className="">
                                        {user.plwdFirstName} can complete another 
                                        <b className="text-fuchsia-900 text-2xl"> {calcGoal(chats.length)} </b> 
                                        to reach a new goal!
                                    </span>
                                </p>
                                <Link to='/schedule'>
                                    <Button variant="outline-primary" size="lg">Schedule a chat</Button>
                                </Link>
                            </div>
                        </div>
                        <p className="font-bold text-2xl">Daily suggestions:</p>
                        {getExercises().map((exercise, index) => {
                            return (
                                <p className="text-xl">{exercise}</p>
                            )
                        })}
                    </div>
                    <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                        <h3>Radar Track</h3>
                        <ScoreRadarChart biomarkerData={chatData.scores} prevBiomarkerData={prevChatData.scores}/>
                        <br/>
                        <p className="text-lg">Based on these scores, I suggest the following activities:</p>
                        <div className="flex md:flex-row flex-col gap-4">
                            <div className="md:w-1/2 w-full border-1 rounded-md border-gray-200 p-[1rem]">
                                <h4>Mad Libs</h4>
                            </div>
                            <div className="md:w-1/2 w-full border-1 rounded-md border-gray-200 p-[1rem]">
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
                    <BiomarkerChart biomarkerData={chatData.scores}/>
                    (You can click on a biomarker score to disable it on the graph, or hover over it to see individual scores.)
                    <h2>Chat History</h2>
                    <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                    {chats.length > 0 ? chats.map((chat, index) => {
                        const prevChatData = index < chats.length-1 ? chats[index + 1] : null; // Get the previous chat if it exists
                        return (
                        <ChatSummary
                            chatData={chat}
                            prevChatData={prevChatData}
                        />
                        );
                    }) : "No chats available."}
                    </div>
                
                </div>
        </>
    );
}

export default Dashboard;