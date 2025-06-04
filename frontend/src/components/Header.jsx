import React, { useContext, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from '../context/AuthContext';
import { GoGear, GoGraph } from "react-icons/go";
import { GrSchedules } from "react-icons/gr";
import { IoExitOutline } from "react-icons/io5";
import { updateGoal } from "../functions/apiRequests";


const Header = ({title, page}) => {
	const { profile, authTokens, logoutUser, goal, setGoal } = useContext(AuthContext);
	const [showModal, setShowModal] = useState(false);
	const [newStartDate, setStartDate] = useState(goal.startDay);
	const [newTarget, setNewTarget] = useState(goal.target);
	const isCaregiver = profile.role !== "Patient";
	const navigate = useNavigate();

	const toDashboard = () => {
        navigate('/dashboard');
    }

    const toSchedule = () => {
        navigate('/schedule');
    }

	const toHistory = () => {
        navigate('/history');
    }

	const toChat = () => {
		navigate('/chat');
	}

	const toToday = () => {
		navigate('/today');
	}

	const toProgress = () => {
		navigate('/progress');
	}

    const toSettings = () => {
        navigate('/settings');
    }

	const handleClose = () => setShowModal(false);
	const handleShow = () => setShowModal(true);

	const changeGoal = async (event) => {
        event.preventDefault();
        const response = await updateGoal(newStartDate, newTarget, authTokens);
        if (response) setGoal({ startDay: newStartDate, target: newTarget, current: goal.current });
        handleClose();
    };


	if (isCaregiver) {
		return (
		<>
			<div className="m-[2rem] flex flex-col gap-2">
				<div className="flex items-center">                
					<h1>{title}</h1>
					<div className="float flex flex-row gap-2 float-right ml-auto">
						<button 
							className={page=="dashboard" ? "linkActive" : "linkInactive"}
							onClick={toDashboard}
						>
							Speech Analysis
						</button>
						<button 
							className={page=="schedule" ? "linkActive" : "linkInactive"}
							onClick={toSchedule}>
								Calendar
						</button>
						<button 
							onClick={toSettings}
							className="px-2"
						>
							<GoGear size={25} style={{ marginRight: '2px' }}/>
						</button>
						<button 
							className="flex bg-violet-600 rounded h-fit p-2 text-white self-center hover:bg-violet-700 duration-200" 
							onClick={() => logoutUser()}
						>
							Log Out
						</button>
					</div>
				</div>
			</div>
		</>
		);
	} else {
		return (
		<>			
			<div className="float flex flex-row m-[2rem]">
                <p className="text-5xl font-semibold">{title}</p>
                <div className="float-right flex items-center ml-auto gap-4">
					<Link className={page=="chat" ? "plwd-link-active" : "plwd-link-inactive"} to="/chat">
						Chat
					</Link>
					<Link className={page=="progress" ? "plwd-link-active" : "plwd-link-inactive"} to="/progress">
						Progress Summary
					</Link>
					<Link className={page=="today" ? "plwd-link-active" : "plwd-link-inactive"} to="/today">
						Review Today
					</Link>
                    <Link className={page=="history" ? "plwd-link-active" : "plwd-link-inactive"} to='/history'>
                        Chat History
                    </Link>
                    <Link className={page=="schedule" ? "plwd-link-active" : "plwd-link-inactive"} to='/schedule'>
                        Schedule
                    </Link>
					<button onClick={handleShow}>
						<GoGear size={25} />
					</button>
                    <button className="plwd-button-fill flex rounded h-fit p-2 text-white self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>

			<Modal show={showModal} onHide={handleClose} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                <Modal.Title>Set Goal</Modal.Title>
                </Modal.Header>
                <Form onSubmit={changeGoal}>
                    <Modal.Body>
                        <Form.Group controlId="formTarget">
                            <Form.Label>Target Chats Per Week</Form.Label>
                            <Form.Control
                                type="number"
                                value={newTarget}
                                onChange={(e) => setNewTarget(e.target.value)}
                            />
                        </Form.Group>
            
                        <Form.Group controlId="formStartDay">
                            <Form.Label>Start Day</Form.Label>
                            <Form.Control 
                                as="select"
                                value={newStartDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            >
                                <option value={6}>Sunday</option>
                                <option value={0}>Monday</option>
                                <option value={1}>Tuesday</option>
                                <option value={2}>Wednesday</option>
                                <option value={3}>Thursday</option>
                                <option value={4}>Friday</option>
                                <option value={5}>Saturday</option>
                            </Form.Control>
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="outline-danger" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Update Goal
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Form>
            </Modal>

		</>
		)
	}
}

export default Header;