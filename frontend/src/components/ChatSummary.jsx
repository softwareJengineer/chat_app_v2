import React from "react";
import compareScores from "../functions/compareScores";
import { useNavigate } from "react-router-dom";

function ChatSummary({chatData, prevChatData}) {
    const navigate = useNavigate();

    const suggested = ["Mad Libs", "Word Matching"];

    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    const compared = compareScores(chatData, prevChatData);

    const toChatDetails = () => {
        navigate('/chatDetails', {state: {chatData: chatData, prevChatData: prevChatData}});
    }

    return (
        <div className="flex">
            <button 
                className="border-1 p-[2rem] border-gray-300 rounded w-full hover:shadow-xl" 
                onClick={() => {toChatDetails()}}
            >
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-1 items-start text-left">
                        <h4>{chatData.date.toLocaleString("en-US", options)}</h4>
                        <div><b>Topics covered: </b>{chatData.topics}</div>
                        <br/>
                        <div><b>Overall Condition:</b></div>
                        <div><b className="text-green-500">Improved</b> in {compared.improved.join(", ")}</div>
                        <div><b className="text-red-500">Declined</b> in {compared.declined.join(", ")}</div>
                        <div><b className="text-gray-500">Stayed steady</b> in {compared.steady.join(", ")}</div>
                        <br/>
                        <div><b>Suggested activities: </b>{suggested.join(", ")}</div>
                    </div>
                    <div className="flex md:flex-row float-right ml-auto">
                        <p><b>{chatData.duration}</b> minutes</p>
                    </div>
                </div>
            </button>
        </div>
    );
}

export default ChatSummary;