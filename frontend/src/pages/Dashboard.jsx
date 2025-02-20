import React from "react";
import Header from "../components/Header";
import SessionSummary from "../components/SessionSummary";

function Dashboard() {
    return (
        <>
            <Header />
            <h1 className="p-[2rem]">Session Data</h1>
            <SessionSummary />
        </>
    )
}

export default Dashboard;