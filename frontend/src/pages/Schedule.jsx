import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import Header from "../components/Header";
import AuthContext from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createReminder, createRepeatReminder, getReminders } from "../functions/apiRequests";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { Link, useNavigate } from "react-router-dom";


function Schedule() {
    const { authTokens, profile } = useContext(AuthContext);
    const [reminders, setReminders] = useState([]);
    const [showNewReminder, setShowNewReminder] = useState(false);
    const [showNewRepeatReminder, setShowNewRepeatReminder] = useState(false);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [titleRepeat, setTitleRepeat] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [repeatDay, setRepeatDay] = useState('Sunday');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReminders = async () => {
            const rem = await getReminders(authTokens);
            setReminders(rem);
        };

        fetchReminders();
    }, []);

    const addReminder = async (event) => {
        event.preventDefault();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            alert("End date must be after start date.");
            return;
        }
        
        const response = await createReminder(title, start, end, authTokens);
        if (response) setReminders((prevReminders) => [...prevReminders, { title, start, end }]);

        handleClose();
    };

    const addRepeatReminder = async (event) => {
        event.preventDefault();
        if (startTime >= endTime) {
            alert("End time must be after start date.");
            return;
        }

        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const daysOfWeek = [weekdays.indexOf(repeatDay)];
        
        const response = await createRepeatReminder(title, startTime, endTime, daysOfWeek, authTokens);
        if (response) setReminders((prevReminders) => [...prevReminders, { title, startTime, endTime, daysOfWeek }]);

        handleRepeatClose();
    };

    const handleClose = () => {
        setShowNewReminder(false);
        resetForm();
    };

    const handleShow = () => setShowNewReminder(true);

    const handleRepeatShow = () => setShowNewRepeatReminder(true);

    const handleRepeatClose = () => {
        setShowNewRepeatReminder(false);
        resetRepeatForm();
    }

    const resetForm = () => {
        setTitle('');
        setStartDate('');
        setEndDate('');
    };

    const resetRepeatForm = () => {
        setTitleRepeat('');
        setStartTime('');
        setEndTime('');
        setRepeatDay('Sunday');
    };

    const events = [
        {
            title: 'example',
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
            rrule: {
                freq: 'daily',
                dtstart: new Date(),
                until: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week later
            }, 
        }
    ]

    return (
        <>
            <Header title="Your Schedule" page="schedule"/> : 
            <div className="h-[75vh] m-[2rem]">
                <FullCalendar
                    plugins={[ timeGridPlugin, rrulePlugin ]}
                    initialView="timeGridWeek"
                    events={reminders}
                    height={"100%"}
                />
            </div>
            <div className="flex flex-row gap-4 justify-center m-[2rem]">
                <Button onClick={handleShow} size="lg">Create a New Reminder</Button>
                <Button onClick={handleRepeatShow} size="lg">Create a New Repeating Reminder</Button>
            </div>


            <Modal show={showNewReminder} onHide={handleClose} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                <Modal.Title>Create New Reminder</Modal.Title>
                </Modal.Header>
                <Form onSubmit={addReminder}>
                    <Modal.Body>
                        <Form.Group controlId="formTitle">
                            <Form.Label>Reminder Label</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter label"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>
            
                        <Form.Group controlId="formStart">
                            <Form.Label>Start</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Form.Group>
            
                        <Form.Group controlId="formEnd">
                            <Form.Label>End</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </Form.Group>
                    
                        <Modal.Footer>
                            <Button variant="outline-danger" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Form>
            </Modal>

            <Modal show={showNewRepeatReminder} onHide={handleRepeatClose} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                <Modal.Title>Create New Reminder</Modal.Title>
                </Modal.Header>
                <Form onSubmit={addRepeatReminder}>
                    <Modal.Body>
                        <Form.Group controlId="formTitle">
                            <Form.Label>Reminder Label</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter label"
                                value={titleRepeat}
                                onChange={(e) => setTitleRepeat(e.target.value)}
                            />
                        </Form.Group>
            
                        <Form.Group controlId="formStartTime">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </Form.Group>
            
                        <Form.Group controlId="formEndTime">
                            <Form.Label>End Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="formRepeat">
                            <Form.Label>Day to Repeat</Form.Label>
                            <Form.Control 
                                as="select"
                                value={repeatDay}
                                onChange={(e) => setRepeatDay(e.target.value)}
                            >
                                <option>Sunday</option>
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                            </Form.Control>
                        </Form.Group>
                    
                        <Modal.Footer>
                            <Button variant="outline-danger" onClick={handleRepeatClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Form>
            </Modal>
        </>
    );
}

export default Schedule;
