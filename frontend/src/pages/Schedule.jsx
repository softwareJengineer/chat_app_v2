import React, { useState, useContext } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import Header from "../components/Header";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { UserContext } from "../App";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from "react-router-dom";


function Schedule() {
    const { user, setUser, reminders, setReminders } = useContext(UserContext);
    const [showNewReminder, setShowNewReminder] = useState(false);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [repeat, setRepeat] = useState('');
    const [recurrences, setRecurrences] = useState(0);
    const localizer = momentLocalizer(moment);
    
    const createReminder = async (start, end) => {
        try {
            const response = await fetch('http://localhost:8000/api/reminders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user,
                    title: title,
                    start: start,
                    end: end
                })
            });

            const data = await response.json();
            if (!data.success) {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error with creating reminder:', error);
        }
    };

    const addReminder = (event) => {
        event.preventDefault();
        for (let i = 0; i <= recurrences; i++) {
            let start = new Date(startDate);
            let end = new Date(endDate);
            if (repeat === 'Daily') {
                start.setDate(start.getDate() + i);
                end.setDate(end.getDate() + i);
            } else if (repeat === 'Weekly') {
                start.setDate(start.getDate() + i * 7);
                end.setDate(end.getDate() + i * 7);
            }
            setReminders((prevReminders) => [...prevReminders, { title, start, end }]);
            createReminder(start, end);
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
                <Calendar
                    localizer={localizer}
                    events={reminders}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
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
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formRecurrences">
                            <Form.Label>Recurrences</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0"
                                disabled={repeat === 'None'}
                                value={recurrences}
                                onChange={(e) => setRecurrences(e.target.value)}
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
        </>
    );
}

export default Schedule;
