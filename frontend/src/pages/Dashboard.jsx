import React, { useState, useEffect, Component } from "react";
import { Button, Dropdown } from "react-bootstrap";
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
        } else {
            return "N/A";
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

    const ScoreButton = ({name, padding, size}) => {
        return (
            <Button
                className={padding + " shadow-md w-full"}
                variant={getActive(name)}
                size={size}
                onClick={() => setDisplayedBiomarker(name)}
            >
                {name}
            </Button>
        );
    }

    const [width, setWidth] = React.useState(window.innerWidth);
    const breakpoint = 700;

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
            window.addEventListener("resize", handleResizeWindow);
            return () => {
            window.removeEventListener("resize", handleResizeWindow);
            };
    }, []);
    
    if (width > breakpoint) {
        return (
            <>
                <Header />
                <BiomarkerChart biomarkerData={biomarkerScores} />
                <span className="flex flex-row space-x-5 mx-[1rem] mb-4 gap-[1rem]">
                    <div className="flex flex-col w-1/5 gap-2">
                        <ScoreButton padding="p-4" name="Pragmatic" />
                        <ScoreButton padding="p-4" name="Grammar" />
                        <ScoreButton padding="p-4" name="Prosody" />
                        <ScoreButton padding="p-4" name="Pronunciation" />
                        <ScoreButton padding="p-4" name="Anomia" />
                        <ScoreButton padding="p-4" name="Turn Taking" />
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
    } else {
        return (
            <>
                <Header />
                <BiomarkerChart biomarkerData={biomarkerScores} />
                <div className="flex justify-center mb-[1rem]">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                            Biomarker Score
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Pragmatic")}>Pragmatic</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Grammar")}>Grammar</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Prosody")}>Prosody</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Pronunciation")}>Pronunciation</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Anomia")}>Anomia</Dropdown.Item>
                            <Dropdown.Item onClick={() => setDisplayedBiomarker("Turn Taking")}>Turn Taking</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                
                <BiomarkerDetails 
                    name={displayedBiomarker}
                    score={score}
                    description={description}
                    yourDescription={yourDescription}
                />
            </>
        )
    }
}

export default Dashboard;