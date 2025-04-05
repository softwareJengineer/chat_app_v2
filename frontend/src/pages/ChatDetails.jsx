import React, { useContext } from "react";
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import WordCloud from "../components/WordCloud";

function ChatDetails() {
    const { user } = useContext(UserContext);
    const location = useLocation();
    const chatData = location.state?.chatData;
    const prevChatData = location.state?.prevChatData;
    const date = new Date(chatData.date);

    const cardStyle = "border-1 border-gray-300 rounded p-[2rem] hover:shadow-xl h-full w-full justify-self-start hover:cursor-pointer";
    const cardHeader = (title) => {
        return (
            <div className="flex">
                <h4>{title}</h4>
                <p className="float flex flex-row gap-2 float-right ml-auto text-blue-500 underline">
                    View Details
                </p>
            </div>
        )
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

    return (
        <>
            <Header title="Single Chat Analysis" page="chatdetails" />
            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.plwdFirstName} {user?.plwdLastName}</p>
                    Cared for by 
                    <FaUser size={50}/>
                    <p className="align-middle">{user?.caregiverFirstName} {user?.caregiverLastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="flex m-[2rem]">
                <h2>{date.toDateString()}</h2>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch m-[2rem] gap-4">
                <div className={cardStyle}>
                    {cardHeader("Daily Topics")}
                    <WordCloud messages={chatData.messages} />
                </div>
                <div className={cardStyle}>
                    {cardHeader("Mood Track")}
                    <p>You felt </p>
                    <p>Because </p>
                </div>
                <div className={cardStyle}>
                    {cardHeader("Pragmatic Review")}
                    {getImprovement(chatData.avgScores.Pragmatic, prevChatData.avgScores.Pragmatic)} 
                </div>
                <div className={cardStyle}>
                    {cardHeader("Grammar Review")}
                    {getImprovement(chatData.avgScores.Grammar, prevChatData.avgScores.Grammar)} 
                </div>
                <div className={cardStyle}>
                    {cardHeader("Prosody Review")}
                    {getImprovement(chatData.avgScores.Prosody, prevChatData.avgScores.Prosody)} 
                </div>
                <div className={cardStyle}>
                    {cardHeader("Pronunciation Review")}
                    {getImprovement(chatData.avgScores.Pronunciation, prevChatData.avgScores.Pronunciation)} 
                </div>
                <div className={cardStyle}>
                    {cardHeader("Grammar Review")}
                    {getImprovement(chatData.avgScores.Grammar, prevChatData.avgScores.Grammar)} 
                </div>
                <div className={cardStyle}>
                    {cardHeader("Turn Taking Review")}
                    {getImprovement(chatData.avgScores["Turn Taking"], prevChatData.avgScores["Turn Taking"])} 
                </div>
            </div>
        </>
    )
}

export default ChatDetails;