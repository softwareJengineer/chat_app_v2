import React, { useContext, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Header from "../components/Header";
import ScoreRadarChart from "../components/ScoreRadarChart";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import daysInARow from "../functions/daysInARow";
import compareScores from "../functions/compareScores";
import { getChats } from "../functions/apiRequests";
import dummyChats from "../data/dummyChats.json"
import GoalProgress from "../components/GoalProgress";

function Dashboard() {
    const { user } = useContext(UserContext);
    const [chats, setChats] = useState([dummyChats]);
    const [chatData, setChatData] = useState(dummyChats[0]);
    const [prevChatData, setPrevChatData] = useState(dummyChats[1]);
    const date = new Date();

    // useEffect(() => {
    //     const fetchChats = async () => {
    //         const userChats = await getChats(user);
    //         setChats(userChats);
    //         setChatData(userChats[0]);
    //         setPrevChatData((userChats.length > 1 ? userChats[1] : null));
    //     };

    //     fetchChats();
    // }, []);

    const calcGoal = (chats) => {
        const goal = chats % 5;
        return 5 - goal;
    }

    const getNextGoal = (chats) => {
        const goal = (Math.floor(chats / 5) + 1) * 5;
        return {goal: goal, current: chats};
    }

    const compared = compareScores(chatData, prevChatData);

    const joinScores = (scores) => {
        var join = "";
        for (var i = 0; i < scores.length; i++) {
            if (i == scores.length - 1) {
                join += scores[i];
            } else if (i == scores.length - 2) {
                join += scores[i] + " and ";
            } else {
                join += scores[i] + ", ";
            }
        }
        return join;
    }

    const scoreSummary = () => {
        var summary = "Compared to the last time we talked, ";
        if (compared.improved.length > 0) {
            summary +=  "you have shown improvement in your " + joinScores(compared.improved) + " scores"
            if (compared.declined.length > 0) {
                summary += ", but have declined in your " + joinScores(compared.declined) + " scores. "
            } else {
                summary += ".";
            }
            if (compared.steady.length > 0) {
                summary += "Your " + joinScores(compared.steady) + " scores did not change. "
            }
        } else if (compared.declined > 0) {
            summary +=  "you have declined in your " + joinScores(compared.declined) + " scores. "
            if (compared.steady.length > 0) {
                summary += "Your " + joinScores(compared.steady) + " scores did not change. "
            }
        } else {
            summary += "your " + joinScores(compared.steady) + " scores did not change. "
        }
        summary += "Keep up the good work!"
        return summary;
    }

    return (
        <>
            <Header title="Your Dashboard" page="dashboard" />
            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.plwdFirstName} {user?.plwdLastName}</p>
                    Care Partner
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.caregiverFirstName} {user?.caregiverLastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="flex m-[2rem]">
                <h2>Daily Overview:</h2>
                <p className="flex float-right ml-auto text-xl">{date.toDateString()}</p>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch m-[2rem] items-center gap-4">
                <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                    <h3>Conclusions and Suggestions</h3>
                    <div className="flex flex-row gap-4 my-[1rem]">
                        <div className="w-1/3">
                            <Avatar />
                        </div>
                        <div className="w-2/3">
                            <p className="font-bold">You're doing fantastic!</p>
                            <GoalProgress props={getNextGoal(chats.length)}/>
                            <p>We've talked for {daysInARow(chats)} in a row.</p>
                            <p>You've completed {chats.length} {chats.length === 1 ? "chat" : "chats"} with me.</p>
                            <p>Complete another {calcGoal(chats.length)} to reach a new goal!</p>
                            <Link to='/schedule'>
                                <Button variant="outline-primary">Schedule a chat</Button>
                            </Link>
                        </div>
                    </div>
                    <p className="font-bold">Daily suggestions:</p>
                    <p>Play a word game with me!</p>
                    <p>Go outside and enjoy the greenery and fresh air.</p>
                </div>
                <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                    <h3>Radar Track</h3>
                    <ScoreRadarChart biomarkerData={chatData.scores} prevBiomarkerData={prevChatData.scores}/>
                        {scoreSummary()}
                    <br/>
                    Based on these scores, I suggest the following activities:
                    <div className="flex md:flex-row flex-col gap-4 m-[1rem]">
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-200 p-[1rem]">
                            <h4>Mad Libs</h4>
                        </div>
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-200 p-[1rem]">
                            <h4>Word Matching</h4>
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard;