import React, { useContext, useState } from "react"
import SessionSummary from "../components/SessionSummary"
import Header from "../components/Header";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import dummyData from "../data/dummyData.json";
import { Button } from "react-bootstrap";

function History() {
    const {user, setUser} = useContext(UserContext);
    
    if (!user) {
        navigate("/login");
    }

    return (
        <>
            <Header />
            <div className="m-[2rem] flex flex-col gap-2">
                <div className="flex items-center">                
                    <h1>History and Trends</h1>
                    <div className="float float-right ml-auto">
                        <Button variant="outline-primary">Download Report</Button>
                    </div>
                </div>
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user.firstName} {user.lastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
                <h2>Trends:</h2>
                <BiomarkerChart biomarkerData={dummyData}/>
                <h2>Chat History</h2>
                <div className="grid grid-cols-3 gap-2">
                    <SessionSummary />
                    <SessionSummary />
                    <SessionSummary />
                </div>
            </div>
        </>
    );
}

export default History;