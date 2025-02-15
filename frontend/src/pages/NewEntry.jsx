import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import { Button, Modal } from "react-bootstrap";
import ChatHistory from "../components/ChatHistory";


function NewEntry() {
    const [show, setShow] = useState(false);
    const location = useLocation();
    const biomarkerData = location.state ? location.state.biomarkerData : [];
    const messages = location.state ? location.state.messages : [];

    const labelStyling = "text-xl my-[1em]";
    const current = new Date();
    const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
    const time = current.getHours() + ':' + current.getMinutes() + ":" + current.getSeconds();

    const navigate = useNavigate();

    const toDashboard = () => {
        navigate('/dashboard', {state: biomarkerData});
    }

    const toChat = () => {
        navigate('/');
    }

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [width, setWidth] = React.useState(window.innerWidth);
    const breakpoint = 700;

    useEffect(() => {
        const handleResizeWindow = () => setWidth(window.innerWidth);
            window.addEventListener("resize", handleResizeWindow);
            return () => {
            window.removeEventListener("resize", handleResizeWindow);
            };
    }, []);

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
                <Button onClick={() => toChat()} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    if (width > breakpoint) {
        return (
        <>
            <div className="mx-[2em] flex flex-row space-x-[4em]">
                <div className="flex flex-col w-1/2">
                    <label className={labelStyling}>Title</label>
                    <input 
                        className="border-1 p-2 mb-[1em] rounded-lg" 
                        name="title" 
                        id="title"
                        placeholder={"Session on " + date} 
                        required 
                    />
                    <label className={labelStyling}>Time</label>
                    <input 
                        className="border-1 p-2 mb-[1em] rounded-lg" 
                        name="time" 
                        id="time" 
                        placeholder = {time}
                        required 
                    />
                    <label className={labelStyling}>Chat History</label>
                    <div className="bg-gray-100 rounded-lg h-1/2 pt-[2em] overflow-y-auto">
                        <ChatHistory messages={messages}></ChatHistory>
                    </div>
                </div>
                <div className="flex flex-col w-1/2">
                    <label className={labelStyling}>Notes</label>
                    <textarea rows={8} className="border-1 rounded-lg p-2" name="notes" id="notes" required/>
                    <div className="mt-[2em]">
                        <BiomarkerChart biomarkerData={biomarkerData}></BiomarkerChart>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center gap-[2em] mt-[2em]">
                <Button variant="outline-danger" onClick={() => handleShow()} size="lg">Cancel</Button>
                <Button onClick={() => toDashboard()} variant="outline-primary" size="lg">Save</Button>
            </div>

            <CloseModal />
        </>
        )
    } else {
        return (
            <>
                <div className="mx-[2em] flex flex-col gap-1">
                    <label className={labelStyling}>Title</label>
                    <input 
                        className="border-1 p-2 rounded-lg" 
                        name="title" 
                        id="title"
                        placeholder={"Session on " + date} 
                        required 
                    />
                    <label className={labelStyling}>Time</label>
                    <input 
                        className="border-1 p-2 rounded-lg" 
                        name="time" 
                        id="time" 
                        placeholder = {time}
                        required 
                    />
                    <label className={labelStyling}>Chat History</label>
                    <div className="bg-gray-100 rounded-lg h-fill pt-[2em] overflow-y-auto">
                        <ChatHistory messages={messages}></ChatHistory>
                    </div>
                    <label className={labelStyling}>Notes</label>
                    <textarea rows={8} className="border-1 rounded-lg p-2" name="notes" id="notes" required/>
                    <div className="mt-[2em]">
                        <BiomarkerChart biomarkerData={biomarkerData}></BiomarkerChart>
                    </div>
                </div>
            <div className="flex justify-center items-center gap-[2em] my-[2em]">
                <Button variant="outline-danger" onClick={() => handleShow()} size="lg">Cancel</Button>
                <Button onClick={() => toDashboard()} variant="outline-primary" size="lg">Save</Button>
            </div>

            <CloseModal />
        </>
        )
    }
}

export default NewEntry;