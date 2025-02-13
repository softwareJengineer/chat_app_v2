import React, { useState, useEffect, Component } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import BiomarkerChart from "../components/BiomarkerChart";
import BiomarkerDetails from "../components/BiomarkerDetails";
import Descriptions from "../data/descriptions.json";
import { useLocation } from "react-router-dom";
import dummyData from "../data/dummyData.json";

const Dashboard = () => {

    const location = useLocation();
    // const biomarkerScores = location.state;
    const biomarkerScores = dummyData;

    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [score, setScore] = useState(getScore(displayedBiomarker));
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);
    const [yourDescription, setYourDescription] = useState(Descriptions["Pragmatic"].details[getScoreDesc]);
    
    useEffect(() => {
        setDescription(Descriptions[displayedBiomarker].description);
        setScore(getScore(displayedBiomarker));
    }, [displayedBiomarker]);

    useEffect(() => {
        var scoreDesc = getScoreDesc(score);
        setYourDescription(Descriptions[displayedBiomarker].details[scoreDesc]);
    }, [score])

    function getActive(biomarker) {
        if (biomarker === displayedBiomarker) {
            return "primary";
        } else {
            return "outline-primary";
        }
    }

    function getScore(biomarker) {
        if (!biomarkerScores || biomarkerScores[0].data.length ===  0) {
            return "N/A";
        }
        var data;
        if (biomarker === "Pragmatic") {
            data = biomarkerScores[0].data;
        } else if (biomarker === "Grammar") {
            data = biomarkerScores[1].data;
        } else if (biomarker === "Prosody") {
            data = biomarkerScores[2].data;
        } else if (biomarker === "Pronunciation") {
            data = biomarkerScores[3].data;
        } else if (biomarker === "Anomia") {
            data = biomarkerScores[4].data;
        } else if (biomarker === "Turn Taking") {
            data = biomarkerScores[5].data;
        } 
        var score = data.reduce((prev, current) => prev + current) / data.length;
        return score.toFixed(2);
    }

    function getScoreDesc(score) {
        if (score <= .20) {
            return "Excellent";
        } else if (score <= .40) {
            return "Good";
        } else if (score <= .60) {
            return "Fair";
        } else if (score <= .80) {
            return "High";
        } else if (score > .80) {
            return "Very High";
        } else {
            return "N/A";
        }
    }
    
    return (
        <>
            <Header />
            <BiomarkerChart biomarkerData={biomarkerScores} />
            <span className="flex flex-row space-x-5 mx-[2em] mb-4 gap-[2em]">
                <div className="flex flex-col w-1/5 gap-2">
                    <Button
                        className="p-4 shadow-md w-full"
                        variant={getActive("Pragmatic")}
                        onClick={() => setDisplayedBiomarker("Pragmatic")}
                    >
                        Pragmatic
                    </Button>
                    <Button
                        className="p-4 shadow-md"
                        variant={getActive("Grammar")}
                        onClick={() => setDisplayedBiomarker("Grammar")}
                    >
                        Grammar
                    </Button>
                    <Button
                        className="p-4 shadow-md"
                        variant={getActive("Prosody")}
                        onClick={() => setDisplayedBiomarker("Prosody")}
                    >
                        Prosody
                    </Button>
                    <Button
                        className="p-4 shadow-md"
                        variant={getActive("Pronunciation")}
                        onClick={() => setDisplayedBiomarker("Pronunciation")}
                    >
                        Pronunciation
                    </Button>
                    <Button
                        className="p-4 shadow-md"
                        variant={getActive("Anomia")}
                        onClick={() => setDisplayedBiomarker("Anomia")}
                    >
                        Anomia
                    </Button>
                    <Button
                        className="p-4 shadow-md"
                        variant={getActive("Turn Taking")}
                        onClick={() => setDisplayedBiomarker("Turn Taking")}
                    >
                        Turn Taking
                    </Button>
                </div>
                <BiomarkerDetails 
                    name={displayedBiomarker}
                    score={score}
                    description={description}
                    yourDescription={yourDescription}
                />
            </span>
        </>
    );
}

export default Dashboard;