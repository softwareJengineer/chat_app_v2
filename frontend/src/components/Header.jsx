import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserOptions from "./UserOptions";
import { GoGear, GoGraph } from "react-icons/go";
import { GrSchedules } from "react-icons/gr";
import { IoExitOutline } from "react-icons/io5";

const Header = ({title, page}) => {
	const { user, setUser } = useContext(UserContext);
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
			username: "patient",
			role: "Patient",
			firstName: "Patient",
			lastName: "Patient",
			email: "example@email.com",
			settings: {}
		})
	}

	const toDashboard = () => {
        navigate('/dashboard');
    }

    const toSchedule = () => {
        navigate('/schedule');
    }

    const toLogOut = () => {
        setUser(null);
        navigate('/');
    }

    const toLogIn = () => {
        navigate('/login');
    }

    const toSettings = () => {
        navigate('/settings');
    }

    const toHistory = () => {
        navigate('/analysis');
    }

	const toAnalysis = () => {
        navigate('/analysis');
    }

	// return (
	// 	<div className='flex pt-[1em] pl-[1em] mr-[1em]'>
	// 		<p className="font-mono text-lg">AI Assistant Chat</p>
	// 		<Button onClick={loginCaregiver}>Caregiver</Button>
	// 		<Button onClick={loginPatient}>Patient</Button>
	// 		<span className="float-right ml-auto gap-[1em] flex flex-row">
	// 			{!isCaregiver ? <Link to="/chat">
	// 				<Button 
	// 				variant={location.pathname === "/chat" ? "primary" : "outline-primary"}
	// 				size={window.innerWidth > 700? "lg" : "md"}
	// 				>
	// 				Chat
	// 				</Button>
	// 			</Link> : null}
	// 			{isCaregiver ? 
    //                 <Button size="lg" variant="outline-primary" onClick={toHistory}>Analysis</Button> : 
    //                 <Button size="lg" variant="outline-primary" onClick={toDashboard}>Dashboard</Button>
    //             }
    //             <Button size="lg" variant="outline-primary" onClick={() => toSchedule()}>Schedule</Button>
    //             <Button size="lg" variant="outline-primary" onClick={() => toSettings()}>Settings</Button>
    //             <Button size="lg" variant="outline-danger" onClick={() => toLogOut()}>Log Out</Button> 
	// 		</span>
	// 	</div>
	// );

	return (
	<>
		<div className="mx-[2rem] mt-[2rem] flex flex-col gap-2">
		<Button onClick={loginCaregiver}>Caregiver</Button>
		<Button onClick={loginPatient}>Patient</Button>
			<div className="flex items-center">                
				<h1>{title}</h1>
				<div className="float flex flex-row gap-2 float-right ml-auto">
					<Button variant="outline-primary" style={{ display: 'flex', alignItems: 'center' }} onClick={toSettings} disabled={page==='settings'}>
						<GoGear size={25} style={{ marginRight: '2px' }}/> Settings
					</Button>
					
					<Button variant="outline-primary" style={{ display: 'flex', alignItems: 'center' }} onClick={toAnalysis} disabled={page==='analysis'}>
						<GoGraph size={25} style={{ marginRight: '2px' }}/> Analysis
					</Button>

					<Button variant="outline-primary" style={{ display: 'flex', alignItems: 'center' }} onClick={toSchedule} disabled={page==='schedule'}>
						<GrSchedules size={25} style={{ marginRight: '2px' }}/> Schedule
					</Button>
						
					<Button variant="outline-danger" style={{ display: 'flex', alignItems: 'center' }} onClick={toLogOut}>
						<IoExitOutline size={25} style={{ marginRight: '2px' }}/> Log Out
					</Button>
				</div>
			</div>
		</div>
	</>
	);
}

export default Header;