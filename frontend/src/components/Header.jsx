import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserOptions from "./UserOptions";

function Header() {
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
        navigate('/history');
    }

	return (
		<div className='flex pt-[1em] pl-[1em] mr-[1em]'>
			<p className="font-mono text-lg">AI Assistant Chat</p>
			<Button onClick={loginCaregiver}>Caregiver</Button>
			<Button onClick={loginPatient}>Patient</Button>
			<span className="float-right ml-auto gap-[1em] flex flex-row">
				{!isCaregiver ? <Link to="/">
					<Button 
					variant={location.pathname === "/chat" ? "primary" : "outline-primary"}
					size={window.innerWidth > 700? "lg" : "md"}
					>
					Chat
					</Button>
				</Link> : null}
				{isCaregiver ? 
                    <Button size="lg" variant="outline-primary" onClick={toHistory}>History</Button> : 
                    <Button size="lg" variant="outline-primary" onClick={toDashboard}>Dashboard</Button>
                }
                <Button size="lg" variant="outline-primary" onClick={() => toSchedule()}>Schedule</Button>
                <Button size="lg" variant="outline-primary" onClick={() => toSettings()}>Settings</Button>
                <Button size="lg" variant="outline-danger" onClick={() => toLogOut()}>Log Out</Button> 
			</span>
		</div>
	);
}

export default Header;