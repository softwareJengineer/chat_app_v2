import React from "react";

function SessionSummary() {
    const date = "01/01/2000";
    const time = "00:00:00";
    const biomarkerData = {
        "Pragmatic": 1,
        "Grammar": 2, 
        "Prosody": 1,
        "Pronunciation": 1,
        "Anomia": 2,
        "Turn Taking": 2
    }

    var scores = Object.keys(biomarkerData).map(function(key) {
            return (
                <div className="flex flex-col gap-2">
                    <div>{key}</div>
                    <div className="justify-center items-center flex">{biomarkerData[key]}</div>
                </div>);
        });


    return (
        <div className="flex mx-[2rem]">
            <button 
                className="border-1 p-[2rem] border-blue-500 hover:bg-blue-500 hover:text-white rounded w-full bg-blue-200" 
                onClick={() => {console.log("clicked")}}
            >
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-2 items-start">
                        <div>Session on {date}</div>
                        <div>{time}</div>
                    </div>
                    <div className="flex flex-row float-right ml-auto gap-4">
                        {scores}
                    </div>
                </div>
            </button>
        </div>
    );
}

export default SessionSummary;