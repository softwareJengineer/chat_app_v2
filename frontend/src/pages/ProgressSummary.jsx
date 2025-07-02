import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";

import { FcCalendar, FcClock, FcSms } from "react-icons/fc";
import daysInARow from "../functions/daysInARow";
import { getChats, getGoal } from "../functions/apiRequests";
//import GoalProgress from "../components/GoalProgress";
import { IoThumbsUp } from "react-icons/io5";
import Header from "../components/Header";
import BlankChat from "../data/blankChat.json";

const ProgressSummary = () => {
    
    const [chats, setChats] = useState([]);
    const [chatCount, setChatCount] = useState(0);
    const [chatData, setChatData] = useState(BlankChat)

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(authTokens);
            if (userChats) {
                setChats(userChats);
                setChatCount(userChats.length);
                setChatData(userChats[0]);
            }    
        };

        fetchChats();
    }, []);



    const calcGoal = () => {
        if (goal.current > goal.target) {
            return 0;
        } else {
            return goal.target - goal.current;
        }
    }
    
    return (
        <>
            <Header title="Progress Summary" page="progress"/>
            <div className="flex md:flex-row flex-col gap-4 mt-[1rem] mb-[3rem] md:min-h-[45vh]">
                <div className="md:w-1/3">
                    <Avatar />
                </div>
                <div className="md:w-2/3 mx-[2rem] align-self-center">
                    <p className="font-bold text-2xl">
                       You're doing fantastic!
                    </p>
                    <GoalProgress current={goal.current} target={goal.target} />
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <span>
                            <b className="text-green-700 text-4xl"> {goal.current} </b> 
                            {goal.current === 1 ? "chat" : "chats"} completed.
                        </span>
                    </p>
                    <p className="text-xl">
                        <span>
                            <b className="text-green-700 text-4xl"> {calcGoal()} </b> 
                            more to reach a new goal!
                        </span>
                    </p>
                    <div className="flex flex-row gap-4">
                        <Link to='/chat'>
                            <Button variant="outline-primary" className="plwd-button-outline" size="lg">Start Chat Now</Button>
                        </Link>
                        <Link to='/schedule'>
                            <Button variant="primary" size="lg" className="plwd-button-fill">Schedule Future Chat</Button>
                        </Link>
                    </div>
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
                        You've had conversations for {daysInARow(chats)} days in a row!
                    </p>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <FcSms size={40} />
                        You talked about: {chatData.topics}
                    </p>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <IoThumbsUp color="e5d754" size={40} />
                        Keep it up! You're doing fantastic!
                    </p>
                </div>
                <div className="pl-[1rem] h-full">
                    <b className="text-2xl">Fun Activities For You</b>
                    <div className="flex md:flex-row flex-col gap-4 my-[1rem]">
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Mad Libs</h4>
                            <p>Requires 10 minutes</p>
                            <div className="flex flex-row gap-4 mt-[1rem]">
                                <Button className="plwd-button-outline" variant="outline-primary">Start now</Button>
                                <Button className="plwd-button-fill">Schedule</Button>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Word Matching</h4>
                            <p>Requires 10 minutes</p>
                            <div className="flex flex-row gap-4 mt-[1rem]">
                                <Button className="plwd-button-outline" variant="outline-primary">Start now</Button>
                                <Button className="plwd-button-fill">Schedule</Button>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </>
    );
 
}

export default ProgressSummary;