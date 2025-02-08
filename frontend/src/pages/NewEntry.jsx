import React, { useState } from "react";
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

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    return (
        <>
            <div className="m-[2em] flex flex-row space-x-[4em]">
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
                    <ChatHistory messages={messages} styling={"bg-blue-100 rounded-lg h-[50vh]"}></ChatHistory>
                </div>
                <div className="flex flex-col w-1/2">
                    <label className={labelStyling}>Notes</label>
                    <textarea rows={8} className="border-1 rounded-lg p-2" name="notes" id="notes" required/>
                    <div className="mt-[2em]">
                        <BiomarkerChart biomarkerData={biomarkerData}></BiomarkerChart>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center gap-[2em]">
                <Button onClick={() => toDashboard()} variant="outline-primary" size="lg">Save</Button>
                <Button variant="outline-danger" onClick={() => handleShow()} size="lg">Cancel</Button>
            </div>

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
                    Are you sure you want to exit without saving this session data?
                </Modal.Body>
                <Modal.Footer>
                <Button variant="outline-primary" onClick={handleClose}>
                    No
                </Button>
                <Button onClick={() => toDashboard()} variant="danger">Yes</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default NewEntry;