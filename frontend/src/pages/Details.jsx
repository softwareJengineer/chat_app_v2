import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { UserContext } from "../App";
import { GiAlarmClock, GiPartyPopper, GiRobotAntennas } from "react-icons/gi";
import daysInARow from "../functions/daysInARow";


const Details = () => {
    const { user } = useContext(UserContext);
    const location = useLocation();
    // const chatData = location.state.chatData;
    const biomarkerData =  [
        {
            name: "Pragmatic",
            data: []
        },
        {
            name: "Grammar",
            data: []
        },
        {
            name: "Prosody",
            data: []
        },
        {
            name: "Pronunciation",
            data: []
        },
        {
            name: "Anomia",
            data: []
        },
        {
            name: "Turn Taking",
            data: []
        },
    ];
    const avg = {
        "Pragmatic": 0,
        "Grammar": 0,
        "Prosody": 0,
        "Pronunciation": 0,
        "Anomia": 0,
        "Turn Taking": 0
    };
    const chatData = {
        user: user,
        date: new Date(),
        scores: biomarkerData,
        avgScores: avg,
        notes: "",
        messages: [],
        duration: 5
    }

    const {chats} = useContext(UserContext);

    const navigate = useNavigate();

    const toDashboard = () => {
        navigate('/dashboard', {state: {chatData: chatData}});
    }

    const toSchedule = () => {
        navigate('/schedule');
    }
    
    return (
        <>
            <Header />
            <div className="flex md:flex-row flex-col m-4 gap-[5rem]">
                <div className="flex justify-left flex-col h-[75vh] w-2/5">
                    <div className="my-[1rem] flex justify-center bg-blue-200 p-[1em] rounded-lg">
                        Thank you for talking to me. I hope to see you again soon!
                    </div>
                    <Avatar />
                </div>
                <div className="flex flex-col mx-[2rem] gap-4 justify-center">
                    <div className="flex flex-row items-center gap-4 text-4xl">
                        <GiPartyPopper size={50} color="orange" /> 
                        We've talked for {daysInARow(chats)} in a row!
                    </div>
                    <div className="flex flex-row items-center gap-4 text-4xl">
                        <GiAlarmClock size={50} color="green" /> 
                        We talked for {chatData.duration} minutes today!
                    </div>
                    <div className="flex flex-row items-center gap-4 text-4xl">
                        <GiRobotAntennas size={50} color="purple" /> 
                        We talked about 3 topics!
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-[1rem] justify-center mb-[2rem] w-2/5 mx-auto">
                <Button size="lg" variant="outline-primary" onClick={toDashboard}>View Chat Analysis</Button>
                <Button size="lg" variant="primary" onClick={toSchedule}>Schedule a Chat</Button>
            </div>
        </>
    );
 
}

export default Details;