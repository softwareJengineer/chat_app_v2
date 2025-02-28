import React, { useState } from "react";
import Header from "../components/Header";
import SessionSummary from "../components/SessionSummary";
import { Button } from "react-bootstrap";
import ScoreRadarChart from "../components/ScoreRadarChart";
import dummyData from "../data/dummyData.json"

function Dashboard() {
    return (
        <>
            <Header />
            <div className="flex flex-row justify-center m-4 items-center gap-4">
                <div className='w-1/2'>
                    <ScoreRadarChart biomarkerData={dummyData}/>
                </div>
                <div className="w-1/2">
                    Hello, user! You've been talking with me for 3 days. During our most recent conversation, your turn-taking score was very strong.
                    Keep up the good work! You could work on your pragatic impairments score.
                </div>
            </div>
        </>
    )
}

export default Dashboard;