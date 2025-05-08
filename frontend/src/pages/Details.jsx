import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import AuthContext from '../context/AuthContext';
import { FcCalendar, FcClock, FcSms } from "react-icons/fc";
import daysInARow from "../functions/daysInARow";
import { getChats } from "../functions/apiRequests";
import GoalProgress from "../components/GoalProgress";
import { IoThumbsUp } from "react-icons/io5";

const Details = () => {
    const { logoutUser, authTokens } = useContext(AuthContext);
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [chatCount, setChatCount] = useState(0);
    const chatData = location.state.chatData;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            const userChats = await getChats(authTokens);
            setChats(userChats);
            setChatCount(userChats.length);
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
    //END FOR TESTING

    const calcGoal = (chats) => {
        const goal = chats % 5;
        return 5 - goal;
    }

    const toLogOut = async () => {
		logoutUser();
    }

    const toToday = () => {
        navigate('/today', {state: {chatData: chatData}});
    }
    
    return (
        <>
            <div className="float flex flex-row ml-auto gap-4 m-[1rem] justify-end">
                <button onClick={() => toToday()} className="text-blue-700 no-underline">Today's Speech Analysis</button>
                <Link className="flex align-middle" style={{textDecoration: 'none'}} to='/history'>
                    <button className="text-blue-700 no-underline">Chat History</button>
                </Link>
                <Link className="flex align-middle" style={{textDecoration: 'none'}} to='/schedule'>
                    <button className="text-blue-700 no-underline">Schedule</button>
                </Link>
                <button className="bg-blue-700 rounded p-2 text-white" onClick={() => toLogOut()}>Quit</button>
            </div>
            <div className="flex md:flex-row flex-col gap-4 mt-[1rem] mb-[3rem] md:min-h-[45vh]">
                <div className="md:w-1/3">
                    <Avatar />
                </div>
                <div className="md:w-2/3 mx-[2rem] align-self-center">
                    <p className="font-bold text-2xl">
                       You're doing fantastic!
                    </p>
                    <GoalProgress current={chatCount}/>
                    <p className="flex flex-row items-center gap-4 text-xl">
                        <span>
                            <b className="text-blue-700 text-2xl"> {chatCount} </b> 
                            {chatCount === 1 ? "chat" : "chats"} completed.
                        </span>
                    </p>
                    <p className="text-xl">
                        <span>
                            <b className="text-blue-700 text-2xl"> {calcGoal(chatCount)} </b> 
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
                                <Button variant="outline-primary">Start now</Button>
                                <Button>Schedule</Button>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full border-1 rounded-md border-gray-300 p-[1rem]">
                            <h4>Word Matching</h4>
                            <p>Requires 10 minutes</p>
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