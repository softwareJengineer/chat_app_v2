import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";
import { Button } from "react-bootstrap";
import ChatHistory from "../components/ChatLog";


function NewEntry() {
    const location = useLocation();
    const biomarkerData = location.state ? location.state.biomarkerData : [];
    const messages = location.state ? location.state.messages : [];

    const labelStyling = "text-xl my-[1em]";

    const navigate = useNavigate();

    const toDetails = () => {
        navigate('/details', {state: {biomarkerData: biomarkerData, messages: messages}});
    }

    const toDashboard = () => {
        navigate('/dashboard');
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
            <div className="mx-[2em] flex flex-row space-x-[4em]">
                <div className="flex flex-col w-1/2">
                    <label className={labelStyling}>Conversation Title</label>
                    <input 
                        className="border-1 p-2 mb-[1em] rounded-lg" 
                        name="title" 
                        id="title"
                        type="text"
                        required 
                    />
                    <label className={labelStyling}>Date</label>
                    <input 
                        className="border-1 p-2 mb-[1em] rounded-lg" 
                        name="date" 
                        id="date"
                        type="date"
                        required 
                    />
                    <label className={labelStyling}>Time</label>
                    <input 
                        className="border-1 p-2 mb-[1em] rounded-lg" 
                        name="time" 
                        id="time" 
                        type="time"
                        required 
                    />
                    <label className={labelStyling}>Chat History</label>
                    <div className="bg-gray-100 rounded-lg h-[55vh] pt-[2em] overflow-y-auto">
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
            <div className="flex justify-center items-center gap-[2em] my-[2em]">
                <Button variant="outline-danger" onClick={() => toDetails()} size="lg">Cancel</Button>
                <Button onClick={() => toDashboard()} variant="outline-primary" size="lg">Save</Button>
            </div>
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
                        placeholder={"Chat on " + date} 
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
                <Button variant="outline-danger" onClick={() => toDetails()} size="lg">Cancel</Button>
                <Button onClick={() => toDashboard()} variant="outline-primary" size="lg">Save</Button>
            </div>
        </>
        )
    }
}

export default NewEntry;