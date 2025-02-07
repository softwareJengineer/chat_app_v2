import React, { useState, useEffect, Component } from "react";
import { Button } from "react-bootstrap";
import Header from '../components/Header';
import BiomarkerChart from "../components/BiomarkerChart";
import BiomarkerDetails from "../components/BiomarkerDetails";
import Descriptions from "../data/descriptions.json";

const Dashboard = ({biomarkerScores1}) => {
    const biomarkerScores = {
        "Pragmatic": 1,
        "Grammar": 2,
        "Anomia": 7,
        "Turn Taking": 3,
        "Prosody": 1,
        "Pronunciation": 7
    }

    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [score, setScore] = useState(biomarkerScores[displayedBiomarker]);
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);
    const [yourDescription, setYourDescription] = useState(Descriptions["Pragmatic"].details[getScore]);
    
    useEffect(() => {
        setDescription(Descriptions[displayedBiomarker].description);
        setScore(biomarkerScores[displayedBiomarker]);
    }, [displayedBiomarker]);

    useEffect(() => {
        var scoreDesc = getScore(score);
        setYourDescription(Descriptions[displayedBiomarker].details[scoreDesc]);
    }, [score])

    function getActive(biomarker) {
        if (biomarker === displayedBiomarker) {
            return "primary";
        } else {
            return "outline-primary";
        }
    }

    function getScore(score) {
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
        }
    }
    
    return (
        <>
            <Header />
            <BiomarkerChart />
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