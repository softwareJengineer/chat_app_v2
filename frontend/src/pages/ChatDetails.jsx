import React, { useContext } from "react";
import Header from "../components/Header";
import { FaUser } from "react-icons/fa";
import { GiPartyPopper, GiAlarmClock, GiRobotAntennas, GiChatBubble } from "react-icons/gi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MyWordCloud from "../components/WordCloud";
import Avatar from "../components/Avatar";
import GoalProgress from "../components/GoalProgress";
import { Button } from "react-bootstrap";
import { FcCalendar, FcClock, FcSms } from "react-icons/fc";
import { IoThumbsUp } from "react-icons/io5";
import daysInARow from "../functions/daysInARow";
import AuthContext from '../context/AuthContext';
import ScoreRadarChart from "../components/ScoreRadarChart";
import getExercises from "../functions/getExercises";
import { Icon } from '@iconify/react';


import { cardStyle } from "../styles/sharedStyles";
import Biomarker     from "../components/Biomarker";

function ChatDetails() {
    const { profile, goal } = useContext(AuthContext);
    const location = useLocation();
    const chatData = location.state?.chatData;
    const prevChatData = location.state?.prevChatData ? 
        location.state.prevChatData : {avgScores: {Pragmatic: 0, Grammar: 0, Prosody: 0, Pronunciation: 0, Anomia: 0, "Turn Taking": 0,}};
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

    const style = new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })

    const toAnalysis = (biomarker) => {
        navigate('/analysis', {state: {chatData: chatData, biomarker: biomarker}})
    }

    return (
        <>
            <Header title="Single Chat Analysis" page="chatdetails" />

            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50} color="purple" />
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
                    Care Partner
                    <FaUser size={50} color="green" />
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                </div>
                <Link to="/settings" className={"caregiver-link"}>
                    Update profile
                </Link>
            </div>

            <div className="flex flex-row m-[2rem] gap-4">
                <b className="text-4xl">Overview:</b>
                <b className="text-purple-500 text-4xl">{style.format(date)}</b>
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
                                {profile.plwdFirstName} is doing fantastic!
                            </p>
                            <GoalProgress current={goal.current} target={goal.target} />
                            <p className="flex flex-row items-center gap-4 text-xl">
                                <GiAlarmClock size={40} color="green" /> 
                                <span>
                                    {style.format(date)} is chat number
                                    <b className="text-green-700 text-2xl"> {chats.length} {goal.current} </b> 
                                    with me.
                                </span>
                            </p>
                            <p className="flex flex-row items-center gap-4 text-xl">
                                <GiRobotAntennas size={40} color="purple" />
                                <span className="">
                                    {profile.plwdFirstName} can complete another 
                                    <b className="text-fuchsia-900 text-2xl"> {calcGoal()} </b> 
                                    to reach a new goal!
                                </span>
                            </p>
                            <p className="flex flex-row items-center gap-4 text-xl">
                                <GiChatBubble size={40} color={"orange"} />
                                We covered these topics in this conversation: {chatData.topics}
                            </p>
                        </div>
                    </div>
                    <p className="font-bold text-2xl">Daily suggestions:</p>
                    {getExercises().map((exercise, index) => {
                            return (
                                <p className="text-xl">{exercise}</p>
                            )
                        })
                    }
                </div>
                <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                    <h3>Radar Track</h3>
                    <div className="h-[45vh] w-full">
                        <ScoreRadarChart biomarkerData={chatData.scores} prevBiomarkerData={prevChatData.scores}/>
                    </div>
                    <br/>
                    <p className="text-lg">Based on these scores, I suggest the following activities:</p>
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

            {/* Detailed Analysis */}
            <h3 className="mx-[2rem]">Detailed Analysis</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch m-[2rem] gap-4">
                <div className={cardStyle}>
                    <h4>Daily Topics</h4>
                    <MyWordCloud messages={chatData.messages} />
                </div>
                <div className={cardStyle}>
                    <h4>Mood Track</h4>
                    <div className="flex flex-row gap-4">
                        <Icon 
                            icon={chatData.sentiment == "Positive" ? "fluent-emoji:beaming-face-with-smiling-eyes" :
                                chatData.sentiment == "Negative" ? "fluent-emoji:confused-face" : "fluent-emoji:face-with-diagonal-mouth"
                             }
                            width="50" 
                            height="50"
                        />
                        <h2 className="text-3xl font-black">{chatData.sentiment}</h2>
                    </div>
                    <p>Here would be an analysis of the mood detected in the conversation. </p>
                </div>
                <div className={cardStyle}>
                    <h4>Pragmatic Review</h4>
                    {getImprovement(chatData.avgScores.Pragmatic, prevChatData.avgScores.Pragmatic)}
                    <p>Here would be an overview of the pragmatic analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Pragmatic")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Grammar Review</h4>
                    {getImprovement(chatData.avgScores.Grammar, prevChatData.avgScores.Grammar)} 
                    <p>Here would be an overview of the grammar analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Grammar")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Prosody Review</h4>
                    {getImprovement(chatData.avgScores.Prosody, prevChatData.avgScores.Prosody)} 
                    <p>Here would be an overview of the prosody analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Prosody")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Pronunciation Review</h4>
                    {getImprovement(chatData.avgScores.Pronunciation, prevChatData.avgScores.Pronunciation)} 
                    <p>Here would be an overview of the pronunciation analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Pronunciation")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Anomia Review</h4>
                    {getImprovement(chatData.avgScores.Anomia, prevChatData.avgScores.Anomia)} 
                    <p>Here would be an overview of the anomia analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Anomia")}>
                        View in Transcript
                    </button>
                </div>
                <div className={cardStyle}>
                    <h4>Turn Taking Review</h4>
                    {getImprovement(chatData.avgScores["Turn Taking"], prevChatData.avgScores["Turn Taking"])} 
                    <p>Here would be an overview of the turn taking analysis.</p>
                    <button className="bg-violet-600 rounded p-2 text-white" onClick={() => toAnalysis("Turn Taking")}>
                        View in Transcript
                    </button>
                </div>
            </div>
        </>
    )
}

export default ChatDetails;