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

    const toSettings = () => {
        navigate('/settings');
    }

	const handleClose = () => setShowModal(false);
	const handleShow = () => setShowModal(true);

	const getStyle = (page, targetPage) => {
		if (page == targetPage) {
			return "text-blue-700 underline decoration-blue-700";
		} else {
			return "text-gray-700 no-underline decoration-gray-700"
		}
 	}

	const changeGoal = async (event) => {
        event.preventDefault();
        const response = await updateGoal(newStartDate, newTarget, authTokens);
        if (response) setGoal({ startDay: newStartDate, target: newTarget, current: goal.current });
        handleClose();
    };


	if (isCaregiver) {
		return (
		<>
			<div className="mx-[2rem] mt-[2rem] flex flex-col gap-2">
				<div className="flex items-center">                
					<h1>{title}</h1>
					<div className="float flex flex-row gap-2 float-right ml-auto">
						<Button 
							variant={page==="settings" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toSettings} 
							disabled={page==='settings'}
						>
							<GoGear size={25} style={{ marginRight: '2px' }}/> Settings
						</Button>
						
						<Button 
							variant={page==="dashboard" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toDashboard} 
							disabled={page==='dashboard'}
						>
							<GoGraph size={25} style={{ marginRight: '2px' }}/> Dashboard
						</Button>

						<Button 
							variant={page==="schedule" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toSchedule} 
							disabled={page==='schedule'}
						>
							<GrSchedules size={25} style={{ marginRight: '2px' }}/> Schedule
						</Button>
							
						<Button 
							variant="outline-danger" 
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={logoutUser}
						>
							<IoExitOutline size={25} style={{ marginRight: '2px' }}/> Log Out
						</Button>
					</div>
				</div>
			</div>
		</>
		);
	} else {
		return (
		<>
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


			<div className="float flex flex-row m-[2rem]">
                <p className="text-5xl font-semibold">{title}</p>
                <div className="float-right flex ml-auto gap-4">
					<Link className="flex align-middle" style={page=="chat" ? {} : {textDecoration: 'none'}} to="/chat">
						<button className={getStyle(page, 'chat')}>Chat</button>
					</Link>
					<Link className="flex align-middle" style={page=="progress" ? {} : {textDecoration: 'none'}} to="/progress">
						<button className={getStyle(page, 'progress')}>Progress Summary</button>
					</Link>
					<Link className="flex align-middle" style={page=="today" ? {} : {textDecoration: 'none'}} to="/today">
						<button className={getStyle(page, 'today')}>Review Today</button>
					</Link>
                    <Link className="flex align-middle" style={page=="history" ? {} : {textDecoration: 'none'}} to='/history'>
                        <button className={getStyle(page, 'history')}>Chat History</button>
                    </Link>
                    <Link className="flex align-middle" style={page=="schedule" ? {} : {textDecoration: 'none'}} to='/schedule'>
                        <button className={getStyle(page, 'schedule')}>Schedule</button>
                    </Link>
					<button onClick={handleShow}>
						<GoGear size={25} />
					</button>
                    <button className="flex bg-blue-700 rounded h-fit p-2 text-white self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>
		</>
		)
	}
}

export default Header;