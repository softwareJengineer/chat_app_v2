import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { UserContext } from "../App";
import { FcCalendar, FcClock, FcSms } from "react-icons/fc";
import daysInARow from "../functions/daysInARow";
import { getChats } from "../functions/apiRequests";
import GoalProgress from "../components/GoalProgress";
import { IoThumbsUp } from "react-icons/io5";

const Details = () => {
    const { user } = useContext(UserContext);
    const [chats, setChats] = useState([]);
    // const [chatData, setChatData] = useState(null);
    const location = useLocation();
    const chatData = location.state.chatData;

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(user);
            setChats(userChats);
            setChatData(userChats[0]);
        };

        fetchChats();
    }, []);

    //FOR TESTING
    // const biomarkerData =  [
    //     {
    //         name: "Pragmatic",
    //         data: []
    //     },
    //     {
    //         name: "Grammar",
    //         data: []
    //     },
    //     {
    //         name: "Prosody",
    //         data: []
    //     },
    //     {
    //         name: "Pronunciation",
    //         data: []
    //     },
    //     {
    //         name: "Anomia",
    //         data: []
    //     },
    //     {
    //         name: "Turn Taking",
    //         data: []
    //     },
    // ];
    // const avg = {
    //     "Pragmatic": 0,
    //     "Grammar": 0,
    //     "Prosody": 0,
    //     "Pronunciation": 0,
    //     "Anomia": 0,
    //     "Turn Taking": 0
    // };
    // const chatData = {
    //     user: user,
    //     date: new Date(),
    //     scores: biomarkerData,
    //     avgScores: avg,
    //     notes: "",
    //     messages: [],
    //     duration: 5,
    //     sentiment: "Positive",
    //     topics: "Holiday, daughter, dog"
    // }

    const navigate = useNavigate();

    const toDashboard = () => {
        navigate('/dashboard', {state: {chatData: chatData}});
    }

    const calcGoal = (chats) => {
        const goal = chats % 5;
        return 5 - goal;
    }
    
    return (
        <>
            <div className="float flex flex-row ml-auto gap-4 m-[1rem] justify-end">
                <button className="text-blue-700">Go to Personal Page</button>
                <button className="bg-blue-700 rounded p-2 text-white">Quit</button>
            </div>
            <div className="flex md:flex-row flex-col gap-4 my-[1rem]">
                <div className="md:w-1/3">
                    <Avatar />
                </div>
                <div className="md:w-2/3 mx-[2rem]">
                    <p className="font-bold text-2xl">
                       You're doing fantastic!
                    </p>
                    <GoalProgress current={chats.length}/>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <span>
                            <b className="text-blue-700 text-2xl"> {chats.length} </b> 
                            {chats.length === 1 ? "chat" : "chats"} completed.
                        </span>
                    </p>
                    <p className="text-xl">
                        <span className="">
                            <b className="text-blue-700 text-2xl"> {calcGoal(chats.length)} </b> 
                            more to reach a new goal!
                        </span>
                    </p>
                    <div className="flex flex-row gap-4">
                        <Link to='/chat'>
                            <Button variant="outline-primary" size="lg">Start Chat Now</Button>
                        </Link>
                        <Link to='/schedule'>
                            <Button variant="primary" size="lg">Schedule Future Chat</Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full mx-[2rem] items-center justify-stretch gap-4 mb-[2rem]">
                <div className="md:border-r-1 md:border-y-0 md:border-l-0 border-y-1 border-gray-300 pr-[2rem]">
                    <b className="text-xl">Today's Conversation</b>
                    <p className="flex flex-row items-center gap-4 text-l">
                        <FcClock size={40} />       
                        The conversation was {chatData.duration} minutes long.
                    </p>
                    <p className="flex flex-row items-center gap-4 text-l">
                        <FcCalendar size={40} />
                        You've had conversations for {daysInARow(chats)} days in a row!
                    </p>
                    <p className="flex flex-row items-center gap-4 text-l">
                        <FcSms size={40} />
                        You talked about: {chatData.topics}
                    </p>
                    <p className="flex flex-row items-center gap-4 text-l">
                        <IoThumbsUp color="e5d754" size={40} />
                        Keep it up! You're doing fantastic!
                    </p>
                </div>
                <div className="pl-[1rem] h-full">
                    <b className="text-xl">Fun Activities For You</b>
                    <div className="flex md:flex-row flex-col gap-4 my-[1rem]">
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Mad Libs</h4>
                            Requires 10 minutes
                            <div className="flex flex-row gap-4 mt-[1rem]">
                                <Button variant="outline-primary">Start now</Button>
                                <Button>Schedule</Button>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Word Matching</h4>
                            Requires 10 minutes
                            <div className="flex flex-row gap-4 mt-[1rem]">
                                <Button variant="outline-primary">Start now</Button>
                                <Button>Schedule</Button>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </>
    );
 
}

export default Details;