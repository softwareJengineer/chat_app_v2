import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import Header from "../components/Header";
import BiomarkerDetails from "../components/BiomarkerDetails";
import ScoreRadarChart from "../components/ScoreRadarChart";
import dummyData from "../data/dummyData.json";
import prevDummyData from "../data/dummyDataPrev.json";
import Descriptions from "../data/descriptions.json";
import { UserContext } from "../App";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";

function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);

    const navigate = useNavigate();
    const date = new Date();

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
            <Header title="Your Dashboard" page="dashboard" />
            <div className="mx-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{user.firstName} {user.lastName}</p>
                </div>
                <Link to="/settings">
                    Update profile
                </Link>
            </div>
            <div className="flex m-[2rem]">
                <h2>Daily Overview:</h2>
                <p className="flex float-right ml-auto text-xl">{date.toDateString()}</p>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 h-full justify-stretch m-[2rem] items-center gap-4">
                <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                    <h3>Conclusions and Suggestions</h3>
                    <div className="flex flex-row gap-4 my-[1rem]">
                        <div className="w-1/3">
                            <Avatar />
                        </div>
                        <div className="w-2/3">
                            <p className="font-bold">You're doing fantastic!</p>
                            <p>You've completed 10 chats with me.</p>
                            <p>Complete another 5 to reach a new goal!</p>
                            <Link to='/schedule'>
                                <Button variant="outline-primary">Schedule a chat</Button>
                            </Link>
                        </div>
                    </div>
                    <p className="font-bold">Daily suggestions:</p>
                    <p>Play a word game with me!</p>
                    <p>Go outside and enjoy the greenery and fresh air.</p>
                </div>
                <div className="w-full h-full border-1 rounded-lg border-gray-200 p-[1rem] self-stretch">
                    <h3>Radar Track</h3>
                    <ScoreRadarChart biomarkerData={dummyData} prevBiomarkerData={prevDummyData}/>
                    Compared to the last time we talked, you have shown improvement in anomia, turn taking, and grammer, but have
                    declined in prosody, pronunciation, and pragmatics. Keep up the good work!
                    <br/>
                    Based on these scores, I suggest the following activities:
                    <div className="flex flex-row gap-4 m-[1rem]">
                        <div className="w-1/2 border-1 rounded-md border-gray-200 p-[1rem]">
                            <h4>Mad Libs</h4>
                        </div>
                        <div className="w-1/2 border-1 rounded-md border-gray-200 p-[1rem]">
                            <h4>Word Matching</h4>
                        </div>  
                    </div>
                </div>
            </div>
            {/* <div className="flex flex-row justify-center m-4 items-center gap-4">
                <div className='w-1/2'>
                    <ScoreRadarChart biomarkerData={dummyData}/>
                </div>
                <div className="w-1/2">
                    Hello, {user.firstName}! You've been talking with me for 3 days. During our most recent conversation, you displayed 
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
            </span> */}
        </>
    )
}

export default Dashboard;