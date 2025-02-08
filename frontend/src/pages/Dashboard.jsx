import React, { useState, useEffect, Component } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import BiomarkerChart from "../components/BiomarkerChart";
import BiomarkerDetails from "../components/BiomarkerDetails";
import Descriptions from "../data/descriptions.json";
import { useLocation } from "react-router-dom";

const Dashboard = () => {

    const location = useLocation();
    const biomarkerScores = location.state;

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
        } else if (biomarker === "Anomia") {
            data = biomarkerScores[2].data;
        } else if (biomarker === "Turn Taking") {
            data = biomarkerScores[3].data;
        } else if (biomarker === "Prosody") {
            data = biomarkerScores[4].data;
        } else if (biomarker === "Pronunciation") {
            data = biomarkerScores[5].data;
        }
        var score = data.reduce((prev, current) => prev + current) / data.length;
        return score.toFixed(2);
    }

    function getScoreDesc(score) {
        if (score <= 2.0) {
            return "Excellent";
        } else if (score <= 4.0) {
            return "Good";
        } else if (score <= 6.0) {
            return "Fair";
        } else if (score <= 8.0) {
            return "Poor";
        } else if (score > 8.0) {
            return "Very Poor";
        } else {
            return "N/A";
        }
    }
    
    return (
        <>
            <Header />
            <BiomarkerChart biomarkerData={biomarkerScores} />
            <span className="flex flex-row space-x-5 mr-4 mb-4">
                <div className="flex flex-col space-y-4 ml-4 w-[25vw]">
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
                        variant={getActive("Pragmatic")}
                        onClick={() => setDisplayedBiomarker("Pragmatic")}
                    >
                        Pragmatic
                    </Button>
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
                        variant={getActive("Grammar")}
                        onClick={() => setDisplayedBiomarker("Grammar")}
                    >
                        Grammar
                    </Button>
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
                        variant={getActive("Prosody")}
                        onClick={() => setDisplayedBiomarker("Prosody")}
                    >
                        Prosody
                    </Button>
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
                        variant={getActive("Pronunciation")}
                        onClick={() => setDisplayedBiomarker("Pronunciation")}
                    >
                        Pronunciation
                    </Button>
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
                        variant={getActive("Anomia")}
                        onClick={() => setDisplayedBiomarker("Anomia")}
                    >
                        Anomia
                    </Button>
                    <Button
                        className="p-4 shadow-md w-[20vw] mb-2"
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