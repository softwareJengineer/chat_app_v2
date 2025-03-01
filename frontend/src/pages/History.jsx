import React, { useState } from "react"
import SessionSummary from "../components/SessionSummary"
import Header from "../components/Header";

function History() {
    return (
        <>
        <Header />
        <h1 className="p-[2rem]">Your Conversation History</h1>
        <SessionSummary />
        </>
    );
}

export default History;