import React, { useContext, useState } from "react"
import SessionSummary from "../components/SessionSummary"
import Header from "../components/Header";
import { UserContext } from "../App";

function History() {
    const {user, setUser} = useContext(UserContext);
    
    if (!user) {
        navigate("/login");
    }

    return (
        <>
        <Header />
        <h1 className="p-[2rem]">Your Conversation History</h1>
        <SessionSummary />
        </>
    );
}

export default History;