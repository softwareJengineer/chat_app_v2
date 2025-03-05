import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import Header from "../components/Header";
import BiomarkerDetails from "../components/BiomarkerDetails";
import ScoreRadarChart from "../components/ScoreRadarChart";
import dummyData from "../data/dummyData.json"
import Descriptions from "../data/descriptions.json";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);

    const navigate = useNavigate();

    if (!user) {
        navigate("/login");
    }

    useEffect(() => {
        setDescription(Descriptions[displayedBiomarker].description);
    }, [displayedBiomarker]);

    function getActive(biomarker) {
        if (biomarker === displayedBiomarker) {
            return "primary";
        } else {
            return "outline-primary";
        }
    }

    const ScoreButton = ({name, padding, size}) => {
        return (
            <Button
                className={padding + " shadow-md w-full"}
                variant={getActive(name)}
                size={size}
                onClick={() => {setDisplayedBiomarker(name)}}
            >
                {name}
            </Button>
        );
    }

    return (
        <>
            <Header />
            <div className="flex flex-row justify-center m-4 items-center gap-4">
                <div className='w-1/2'>
                    <ScoreRadarChart biomarkerData={dummyData}/>
                </div>
                <div className="w-1/2">
                    Hello, {user.username}! You've been talking with me for 3 days. During our most recent conversation, you displayed 
                    less disrupted turn taking. Keep up the good work! You could work on your pragatic impairment score.
                </div>
            </div>
            <h1 className="flex justify-center pb-[2rem]">What do these scores mean?</h1>
            <span className="flex flex-row space-x-5 mx-[1rem] mb-4 gap-[1rem]">
                <div className="flex flex-col w-1/5 gap-2">
                    <ScoreButton padding="p-4" name="Pragmatic" />
                    <ScoreButton padding="p-4" name="Grammar" />
                    <ScoreButton padding="p-4" name="Prosody" />
                    <ScoreButton padding="p-4" name="Pronunciation" />
                    <ScoreButton padding="p-4" name="Anomia" />
                    <ScoreButton padding="p-4" name="Turn Taking"  />
                </div>
                <BiomarkerDetails 
                    name={displayedBiomarker}
                    score={-1}
                    description={description}
                />
            </span>
        </>
    )
}

export default Dashboard;