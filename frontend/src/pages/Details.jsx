import React, { useState, useEffect, useContext } from "react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import Header from '../components/Header';
import BiomarkerChart from "../components/BiomarkerChart";
import BiomarkerDetails from "../components/BiomarkerDetails";
import Descriptions from "../data/descriptions.json";
import { useLocation, useNavigate } from "react-router-dom";
import dummyData from "../data/dummyData.json";
import ChatHistory from "../components/ChatHistory";
import ScoreRadarChart from "../components/ScoreRadarChart";
import Avatar from "../components/Avatar";
import { UserContext } from "../App";
import { GiAlarmClock, GiPartyPopper, GiRobotAntennas } from "react-icons/gi";


const Details = () => {
    const location = useLocation();
    const biomarkerData1 = location.state.biomarkerData;
    const biomarkerData = dummyData;
    const messages = location.state.messages;

    const {user, setUser} = useContext(UserContext);
    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [score, setScore] = useState(getScore(displayedBiomarker));
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);
    const [yourDescription, setYourDescription] = useState(Descriptions["Pragmatic"].details[getScoreDesc]);
    const [showCM, setShowCM] = useState(false);
    const [showDV, setShowDV] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);
    const [viewDetails, setViewDetails] = useState(false);
    const navigate = useNavigate();

    const isCaregiver = user.role !== "Patient";
    const breakpoint = 700;
    
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
        if (!biomarkerData || biomarkerData[0].data.length ===  0) {
            return "N/A";
        }
        var data;
        if (biomarker === "Pragmatic") {
            data = biomarkerData[0].data;
        } else if (biomarker === "Grammar") {
            data = biomarkerData[1].data;
        } else if (biomarker === "Prosody") {
            data = biomarkerData[2].data;
        } else if (biomarker === "Pronunciation") {
            data = biomarkerData[3].data;
        } else if (biomarker === "Anomia") {
            data = biomarkerData[4].data;
        } else if (biomarker === "Turn Taking") {
            data = biomarkerData[5].data;
        } else {
            return "N/A";
        }
        var score = data.reduce((prev, current) => prev + current) / data.length;
        return score.toFixed(2);
    }

    function getScoreDesc(score) {
        if (score <= .20) {
            return "Very Low";
        } else if (score <= .40) {
            return "Low";
        } else if (score <= .60) {
            return "Fair";
        } else if (score <= .80) {
            return "Good";
        } else if (score > .80) {
            return "Excellent";
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

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
            window.addEventListener("resize", handleResizeWindow);
            return () => {
            window.removeEventListener("resize", handleResizeWindow);
            };
    }, []);

    const toDashboard = () => {
        navigate('/dashboard', {state: biomarkerData});
    }

    const toNew = () => {
        navigate('/new', {state: {messages: messages, biomarkerData: biomarkerData}});
    }

    const toChat = (messages) => {
        navigate('/', {state: {messages: messages, biomarkerData: biomarkerData}});
    }

    const handleCloseCM = () => setShowCM(false);
    const handleShowCM = () => setShowCM(true);
    const handleCloseDV = () => setShowDV(false);
    const handleShowDV = () => setShowDV(true);

    function CloseModal() {
        return (
            <Modal
                show={showCM}
                onHide={handleCloseCM}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to exit without saving this chat data? All data will be lost.
                </Modal.Body>
                <Modal.Footer>
                <Button variant="outline-primary" onClick={handleCloseCM}>
                    No
                </Button>
                <Button onClick={() => toChat([])} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    function ShowDetailsModal() {
        return (
            <Modal
                show={showDV}
                onHide={handleCloseDV}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                <Modal.Title>Show Speech Analysis?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to see the speech analysis? The data may be upsetting for some users.
                </Modal.Body>
                <Modal.Footer>
                <Button variant="outline-primary" onClick={handleCloseDV}>
                    No
                </Button>
                <Button onClick={() => {setViewDetails(true); handleCloseDV()}} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        )
    }
    
    if (width > breakpoint) {
        return (
            <>
                <Header />
                <div className="flex md:flex-row flex-col m-4 gap-[5rem]">
                    <div className="flex justify-left flex-col h-[75vh] w-2/5">
                        <div className="my-[1rem] flex justify-center bg-blue-200 p-[1em] rounded-lg">
                                    Thank you for talking to me. I hope to see you again soon!
                        </div>
                        <Avatar />
                    </div>
                    <div className="flex flex-col mx-[2rem] gap-4 justify-center">
                        <div className="flex flex-row items-center gap-4 text-4xl">
                            <GiPartyPopper size={50} color="orange" /> 
                            We've talked for 5 days in a row!
                        </div>
                        <div className="flex flex-row items-center gap-4 text-4xl">
                            <GiAlarmClock size={50} color="green" /> 
                            We talked for 25 minutes today!
                        </div>
                        <div className="flex flex-row items-center gap-4 text-4xl">
                            <GiRobotAntennas size={50} color="purple" /> 
                            We talked about 3 topics!
                        </div>
                    </div>
                </div>
                {/* {isCaregiver ? 
                <div className="flex flex-row gap-[2rem] justify-center mb-[2rem]">
                    <Button 
                        size="lg"
                        variant="outline-primary"
                        onClick={() => toChat(messages)}
                    >
                        Back
                    </Button>
                    <Button
                        size="lg"
                        variant="danger"
                        onClick={() => handleShowCM()}
                    >
                        Delete Data
                    </Button>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => toNew()}
                    >
                        Save Data
                    </Button>
                </div> : <></>} */}
                <CloseModal />
                <div className="flex flex-col gap-[1rem] justify-center mb-[2rem] w-2/5 mx-auto">
                    <Button size="lg" onClick={toDashboard}>Your Dashboard</Button>
                    <Button size="lg" variant="outline-primary" onClick={() => handleShowDV()}>View Speech Analysis</Button>
                </div>
                <ShowDetailsModal />

                {viewDetails ? 
                    <div>
                        <div className="flex justify-center">
                            <ScoreRadarChart biomarkerData={biomarkerData} />
                        </div>
                        <BiomarkerChart biomarkerData={biomarkerData} />
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
                                displayName={displayedBiomarker}
                                score={score}
                                description={description}
                                yourDescription={yourDescription}
                            />
                        </span>
                        <div className="flex justify-center m-[1rem] bg-gray-100 rounded-lg p-[3rem]">
                            <div className="overflow-y-auto h-[30vh] w-full">
                                <ChatHistory messages={messages}/>
                            </div>
                        </div>
                    </div>
            : <></>}
            </>
        );
    } else {
        return (
            <>
                <Header />
                <div className="flex flex-col m-4 gap-4 items-center justify-center py-[2rem]">
                    <div className="h-[50vh]">
                        <Avatar />
                    </div>
                    <div>
                        Thank you for talking with me! We talked for 10 minutes. I hope to see you again tomorrow!
                    </div>
                </div>
                    {/* {isCaregiver ? 
                    <div className="flex flex-row gap-[2rem] justify-center mb-[2rem]">
                        <Button 
                            size="lg"
                            variant="outline-primary"
                            onClick={() => toChat(messages)}
                        >
                            Back
                        </Button>
                        <Button
                            size="lg"
                            variant="danger"
                            onClick={() => handleShowCM()}
                        >
                            Delete Data
                        </Button>
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => toNew()}
                        >
                            Save Data
                        </Button>
                    </div> : <></>} */}
                <CloseModal />
                <div className="flex justify-center mb-[2rem]">
                    <Button size="lg" variant="outline-primary" onClick={() => handleShowDV()}>Show Detailed View?</Button>
                </div>
                <ShowDetailsModal />
                {viewDetails ? 
                <div className="flex flex-col justify-center m-[1rem]">
                    <div className="h-fit w-[100vw]">
                        <ScoreRadarChart biomarkerData={biomarkerData}/>
                    </div>
                    <BiomarkerChart biomarkerData={biomarkerData} />
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
                    <BiomarkerDetails 
                        name={displayedBiomarker}
                        displayname={displayedBiomarker}
                        score={score}
                        description={description}
                        yourDescription={yourDescription}
                    />
                    <div className="flex justify-center gap-[2rem] mt-[1rem] bg-gray-100 rounded-lg p-[3rem]">
                        <div className="overflow-y-auto h-[30vh] w-full">
                            <ChatHistory messages={messages}/>
                        </div>
                    </div>
                </div> : <></>};
 
            </>
        )
    }
}

export default Details;