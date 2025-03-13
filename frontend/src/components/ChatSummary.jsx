import React from "react";

function ChatSummary() {
    const date = "January 01, 2000";
    const time = "00:00:00";
    const biomarkerData = {
        "Pragmatic": 1,
        "Grammar": 2, 
        "Prosody": 1,
        "Pronunciation": 1,
        "Anomia": 2,
        "Turn Taking": 2
    }
    const topics = ["topic 1", "topic 2", "topic 3"];
    const improved = ["pronunciation", "grammar"];
    const declined = ["anomia", "prosody"];
    const duration = 20;
    const suggested = ["Mad Libs", "Word Matching"];

    var scores = Object.keys(biomarkerData).map(function(key) {
            return (
                <div className="flex flex-col gap-2">
                    <div>{key}</div>
                    <div className="justify-center items-center flex">{biomarkerData[key]}</div>
                </div>);
    });

    return (
        <div className="flex">
            <button 
                className="border-1 p-[2rem] border-gray-300 rounded w-full hover:shadow-xl" 
                onClick={() => {console.log("clicked")}}
            >
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-1 items-start">
                        <h4>{date} {time}</h4>
                        <div><b>Topics covered: </b>{topics.join(", ")}</div>
                        <br/>
                        <div><b>Overall Condition:</b></div>
                        <div><b className="text-green-500">Improved</b> in {improved.join(", ")}</div>
                        <div><b className="text-red-500">Declined</b> in {declined.join(", ")}</div>
                        <br/>
                        <div><b>Suggested activities: </b>{suggested.join(", ")}</div>
                    </div>
                    <div className="flex md:flex-row float-right ml-auto">
                        <p><b>{duration}</b> minutes</p>
                    </div>
                </div>
            </button>
        </div>
    );
}

export default ChatSummary;