import React, { useState } from "react";
import Header from "../components/Header";
import SessionSummary from "../components/SessionSummary";
import { Button } from "react-bootstrap";

function Dashboard() {
    const [reminders, setReminders] = useState([{label: "Reminder 1", date: "Nov 1, 2000", time: "00:00:00 UTC"}]);

    function addReminder(label, date, time) {
        setReminders((prevReminders) => [...prevReminders, { label, date, time }]);
    };

    function renderReminder(label, date, time) {
        return (
            <div className="border-1 border-gray-300 rounded-lg flex flex-col gap-1 p-[1rem] my-2">
                <p>{label}</p>
                <p>{date} at {time}</p>
            </div>
        )
    }

    return (
        <>
            <Header />
            <div className="m-4">
                <Button variant="outline-danger">Log Out</Button>
            </div>
            <div className="flex md:flex-row flex-col m-[2rem] gap-4 md:h-[30vh]">
                <div className="md:w-1/2 overflow-y-auto">
                    <h2>Your Reminders</h2>
                    {reminders.map(({label, date, time}, i) => (
                        renderReminder(label, date, time)
                    ))}
                </div>
                <div className="md:w-1/2">
                    <h2>Create a new reminder</h2>
                    <form>
                        <div className="flex flex-col gap-2 mt-[2rem]">
                            <label>Label</label>
                            <input className="border-1 border-gray-300 p-2 rounded-md" placeholder="Reminder label"></input>
                            <label>When:</label>
                            <input className="border-1 border-gray-300 p-2 rounded-md mb-4" type="datetime-local"></input>
                            <Button>Create</Button>
                        </div>
                    </form>
                </div>
            </div>
            <h1 className="p-[2rem]">Session Data</h1>
            <SessionSummary />
        </>
    )
}

export default Dashboard;