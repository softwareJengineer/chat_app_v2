import React, { useState, useEffect } from "react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import Header from '../components/Header';
import BiomarkerChart from "../components/BiomarkerChart";
import BiomarkerDetails from "../components/BiomarkerDetails";
import Descriptions from "../data/descriptions.json";
import { useLocation, useNavigate } from "react-router-dom";
import dummyData from "../data/dummyData.json";
import ChatHistory from "../components/ChatHistory";

const Details = () => {
    const location = useLocation();
    const biomarkerData = location.state.biomarkerData;
    const messages = location.state.messages;

    const [displayedBiomarker, setDisplayedBiomarker] = useState("Pragmatic");
    const [score, setScore] = useState(getScore(displayedBiomarker));
    const [description, setDescription] = useState(Descriptions["Pragmatic"].description);
    const [yourDescription, setYourDescription] = useState(Descriptions["Pragmatic"].details[getScoreDesc]);
    const [show, setShow] = useState(false);
    const [width, setWidth] = React.useState(window.innerWidth);
    const breakpoint = 700;
    const navigate = useNavigate();
    
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

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function CloseModal() {
        return (
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                <Modal.Title>Unsaved Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to exit without saving this session data? All data will be lost.
                </Modal.Body>
                <Modal.Footer>
                <Button variant="outline-primary" onClick={handleClose}>
                    No
                </Button>
                <Button onClick={() => toChat([])} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        )
    }
    
    if (width > breakpoint) {
        return (
            <>
                <Header />
                <BiomarkerChart biomarkerData={biomarkerData} />
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
                        onClick={() => handleShow()}
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
                </div>
                <CloseModal />
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
                <div className="flex flex-col gap-[2rem] m-[1rem] bg-gray-100 rounded-lg p-[3rem] items-center">
                    <h2>Chat History</h2>
                    <div className="flex overflow-y-auto h-[30vh]">
                        <ChatHistory messages={messages}/>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                <Header />
                <BiomarkerChart biomarkerData={biomarkerData} />
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
                        onClick={() => handleShow()}
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
                </div>
                <CloseModal />
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
                <div className="flex m-[1rem] justify-center items-center bg-gray-100 rounded-lg p-[1rem] overflow-y-auto h-[30vh]">
                    <h2>Chat History</h2>
                    <ChatHistory messages={messages}/>
                </div>
            </>
        )
    }
}

export default Details;