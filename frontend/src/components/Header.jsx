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
	const isCaregiver = user ? user.role !== "Patient" : false;
	const navigate = useNavigate();

	function loginCaregiver() {
		setUser({
			caregiverUsername: "Caregiver",
			role: "Caregiver",
			caregiverFirstName: "Caregiver",
			caregiverLastName: "Caregiver",
			plwdUsername: "PLwD",
			plwdFirstName: "PLwD",
			plwdLastName: "PLwD",
			settings: {}
		})
	}

	function loginPatient() {
		setUser({
			caregiverUsername: "Caregiver",
			role: "Patient",
			caregiverFirstName: "Caregiver",
			caregiverLastName: "Caregiver",
			plwdUsername: "PLwD",
			plwdFirstName: "PLwD",
			plwdLastName: "PLwD",
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

	const toHistory = () => {
        navigate('/chathistory');
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
							variant={page==="today" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toChat} 
							disabled={page==='today'}
						>
							<GoGraph size={25} style={{ marginRight: '2px' }}/> Recent Speech Analysis
						</Button>

						<Button 
							variant={page==="history" ? "outline-secondary" : "outline-primary"}
							style={{ display: 'flex', alignItems: 'center' }} 
							onClick={toHistory} 
							disabled={page==='history'}
						>
							<FaRobot size={25} style={{ marginRight: '2px' }}/> History
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