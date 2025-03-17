import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { GoGear, GoGraph } from "react-icons/go";
import { GrSchedules } from "react-icons/gr";
import { IoExitOutline } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { logout } from "../functions/apiRequests";


const Header = ({title, page}) => {
	const { user, setUser, setSettings } = useContext(UserContext);
	const location = useLocation();
	const isCaregiver = user?.role !== "Patient";
	const navigate = useNavigate();

	function loginCaregiver() {
		setUser({
			username: "Caregiver",
			role: "Caregiver",
			firstName: "Caregiver",
			lastName: "Caregiver",
			email: "example@email.com",
			settings: {}
		})
	}

	function loginPatient() {
		setUser({
			username: "plwd",
			role: "Patient",
			firstName: "PLwD",
			lastName: "PLwD",
			email: "example@email.com",
			settings: {}
		})
	}

	const toDashboard = () => {
        navigate('/dashboard');
    }

	const toChat = () => {
		navigate('/chat');
	}

    const toSchedule = () => {
        navigate('/schedule');
    }

    const toLogOut = async () => {
		setUser(null);
		setSettings({
			'patientViewOverall': true,
			'patientCanSchedule': true,
		});
		// await logout(); 
        navigate('/');
    }

    const toSettings = () => {
        navigate('/settings');
    }

	const toAnalysis = () => {
        navigate('/analysis');
    }

	if (!user) {
		return (
		<>
			<div className="flex flex-row gap-2">
				<Button onClick={loginCaregiver}>Caregiver</Button>
				<Button onClick={loginPatient}>PLwD</Button>
			</div>
			<div className="flex items-center">                
				<h1>{title}</h1>
			</div>
		</>
		)
	} else if (isCaregiver) {
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
							variant={page==="analysis" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toAnalysis} 
							disabled={page==='analysis'}
						>
							<GoGraph size={25} style={{ marginRight: '2px' }}/> Analysis
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
							onClick={toLogOut}
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
			<div className="mx-[2rem] mt-[2rem] flex flex-col gap-2">
				<div className="flex items-center">                
					<h1>{title}</h1>
					<div className="float flex flex-row gap-2 float-right ml-auto">
						<Button 
							variant={page==="chat" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toChat} 
							disabled={page==='chat'}
						>
							<FaRobot size={25} style={{ marginRight: '2px' }}/> Chat
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
							onClick={toLogOut}
						>
							<IoExitOutline size={25} style={{ marginRight: '2px' }}/> Log Out
						</Button>
					</div>
				</div>
			</div>
		</>
		)
	}
}

export default Header;