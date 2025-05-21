import React, { useContext } from "react";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MyWordCloud from "../components/WordCloud";
import Avatar from "../components/Avatar";
import GoalProgress from "../components/GoalProgress";
import { Button } from "react-bootstrap";
import { FcCalendar, FcClock, FcSms } from "react-icons/fc";
import { IoThumbsUp } from "react-icons/io5";
import daysInARow from "../functions/daysInARow";
import AuthContext from '../context/AuthContext';

function ChatDetails() {
    const { profile, goal } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const chatData = location.state?.chatData;
    const prevChatData = location.state?.prevChatData ? 
        location.state.prevChatData : 
        {avgScores: {
            Pragmatic: 0,
            Grammar: 0,
            Prosody: 0,
            Pronunciation: 0,
            Anomia: 0,
            "Turn Taking": 0,
        }};
    const chats = location.state?.chats;
    const date = new Date(chatData.date);

    const cardStyle = "border-1 border-gray-300 rounded p-[2rem] hover:shadow-xl h-full w-full justify-self-start";

    const calcGoal = () => {
        if (goal.current > goal.target) {
            return 0;
        } else {
            return goal.target - goal.current;
        }
    }

    const getImprovement = (current, prev) => {
        const score = Math.abs(Math.round((current - prev) * 1000) / 10);
        if (current > prev) {
            return (
                <div className="flex flex-row gap-3 items-center">
                    <p className="rounded-full bg-green-500 p-2 size-[3rem] aspect-square items-center justify-center flex font-bold">
                        +{score}
                    </p>
                    <p className="font-bold">Improved</p>
                </div>
            )
        } else if (current < prev) {
            return (
                <div className="flex flex-row gap-3 items-center">
                    <p className="rounded-full bg-red-500 p-2 size-[3rem] aspect-square items-center justify-center flex font-bold">
                        -{score}
                    </p>
                    <p className="font-bold">Declined</p>
                </div>
            )
        } else {
            return (
                <div className="flex flex-row gap-3 items-center">
                    <p className="rounded-full bg-gray-300 p-2 size-[3rem] aspect-square items-center justify-center flex font-bold">
                        +0
                    </p>
                    <p className="font-bold">Steady</p>
                </div>
            )
        }
    }

    const toAnalysis = (biomarker) => {
        navigate('/analysis', {state: {chatData: chatData, biomarker: biomarker}})
    }

    return (
        <>
            <Header title="Single Chat Analysis" page="chatdetails" />
            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
                    Care Partner
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="flex flex-row m-[2rem] gap-4">
                <b className="text-4xl">Overview:</b>
                <b className="text-purple-500 text-4xl">{date.toDateString()}</b>
            </div>
            <div className="flex md:flex-row flex-col gap-4 mt-[1rem] mb-[3rem] md:min-h-[45vh]">
                <div className="md:w-1/3">
                    <Avatar />
                </div>
                <div className="md:w-2/3 mx-[2rem] align-self-center">
                    <p className="font-bold text-2xl">
                       {profile.plwdFirstName} is doing fantastic!
                    </p>
                    <GoalProgress current={goal.current} target={goal.target} />
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <span>
                            <b className="text-blue-700 text-2xl"> {chats} </b> 
                            {chats === 1 ? "chat" : "chats"} completed.
                        </span>
                    </p>
                    <p className="text-xl">
                        <span className="">
                            <b className="text-blue-700 text-2xl"> {calcGoal()} </b> 
                            more to reach a new goal!
                        </span>
                    </p>
                    <Link to='/schedule'>
                        <Button variant="primary" size="lg">Schedule Future Chat</Button>
                    </Link>
                </div>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full mx-[2rem] items-center justify-stretch gap-4 mb-[2rem]">
                <div className="md:border-r-1 md:border-y-0 md:border-l-0 border-y-1 border-gray-300 pr-[2rem]">
                    <b className="text-2xl">Today's Conversation</b>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <FcClock size={40} />       
                        The conversation was {chatData.duration} minutes long.
                    </p>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <FcCalendar size={40} />
                        {profile.plwdFirstName} has had conversations with me for {daysInARow(chats)} days in a row!
                    </p>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <FcSms size={40} />
                        {profile.plwdFirstName} talked about: {chatData.topics}
                    </p>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <IoThumbsUp color="e5d754" size={40} />
                        Tell {profile.plwdFirstName} to keep it up! They're doing fantastic!
                    </p>
                </div>
                <div className="pl-[1rem] h-full">
                    <b className="text-2xl">Suggested Activities for {profile.plwdFirstName}</b>
                    <div className="flex md:flex-row flex-col gap-4 my-[1rem]">
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Mad Libs</h4>
                            <p>Requires 10 minutes</p>
                            <Button>Schedule</Button>
                        </div>
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Word Matching</h4>
                            <p>Requires 10 minutes</p>
                            <Button>Schedule</Button>
                        </div>  
                    </div>
                </div>
            </div>
            <h3 className="mx-[2rem]">Detailed Analysis</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch m-[2rem] gap-4">
                <div className={cardStyle}>
                    <h4>Daily Topics</h4>
                    <MyWordCloud messages={chatData.messages} />
                </div>
                <div className={cardStyle}>
                    <h4>Mood Track</h4>
                    <p>You felt {chatData.sentiment}</p>
                    <p>Because... </p>
                </div>
                <div className={cardStyle}>
                    <h4>Pragmatic Review</h4>
                    {getImprovement(chatData.avgScores.Pragmatic, prevChatData.avgScores.Pragmatic)}
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Pragmatic")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Grammar Review</h4>
                    {getImprovement(chatData.avgScores.Grammar, prevChatData.avgScores.Grammar)} 
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Grammar")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Prosody Review</h4>
                    {getImprovement(chatData.avgScores.Prosody, prevChatData.avgScores.Prosody)} 
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Prosody")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Pronunciation Review</h4>
                    {getImprovement(chatData.avgScores.Pronunciation, prevChatData.avgScores.Pronunciation)} 
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Pronunciation")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Anomia Review</h4>
                    {getImprovement(chatData.avgScores.Anomia, prevChatData.avgScores.Anomia)} 
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Anomia")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Turn Taking Review</h4>
                    {getImprovement(chatData.avgScores["Turn Taking"], prevChatData.avgScores["Turn Taking"])} 
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Turn Taking")}>
                        View in Transcript
                    </button>
                </div>
            </div>
        </>
    )
}

export default ChatDetails;