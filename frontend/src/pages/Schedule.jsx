import React, { useState, useEffect, useContext } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import Header from "../components/Header";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import AuthContext from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createReminder, getReminders } from "../functions/apiRequests";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';


function Schedule() {
    const { user } = useContext(AuthContext);
    const [reminders, setReminders] = useState([]);
    const [showNewReminder, setShowNewReminder] = useState(false);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [repeat, setRepeat] = useState('');
    const localizer = momentLocalizer(moment);

    useEffect(() => {
        const fetchReminders = async () => {
            const rem = await getReminders(user);
            setReminders(rem);
        };

        fetchReminders();
    }, []);

    const addReminder = async (event) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        event.preventDefault();
        if (repeat === 'None') {
            if (start >= end) {
                alert("End date must be after start date.");
                return;
            }
            const response = await createReminder(user, title, start, end);
            if (response) setReminders((prevReminders) => [...prevReminders, { title, start, end }]);
        } else {
            const duration = end.getTime() - start.getTime();
            const rrule = {
                freq: repeat.toLowerCase(),
                dtstart: new Date(startDate),
            }
            const response = await createReminder(user, title, start, end, rrule, duration);
            if (response) setReminders((prevReminders) => [...prevReminders, { title, start, end, rrule, duration }]);
        }

        handleClose();
    };

    const handleClose = () => {
        setShowNewReminder(false);
        resetForm();
    };

    const handleShow = () => setShowNewReminder(true);

    const resetForm = () => {
        setTitle('');
        setStartDate('');
        setEndDate('');
        setRepeat('');
        setRecurrences(0);
    };

    return (
        <>
            <Header title="Your Schedule" page="schedule"/>
            <div className="h-[75vh] m-[2rem]">
                {/* <Calendar
                    localizer={localizer}
                    events={reminders}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                /> */}
                <FullCalendar
                    plugins={[ timeGridPlugin, rrulePlugin ]}
                    initialView="timeGridWeek"
                    events={reminders}
                    height={"100%"}
                />
            </div>
            <div className="flex justify-center m-[2rem]">
                <Button onClick={handleShow} size="lg">Create a New Reminder</Button>
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

                        <Form.Group controlId="formRepeat">
                            <Form.Label>Repeat</Form.Label>
                            <Form.Control 
                                as="select"
                                value={repeat}
                                onChange={(e) => setRepeat(e.target.value)}
                            >
                                <option>None</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </Form.Control>
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
        </>
    );
}

export default Schedule;
