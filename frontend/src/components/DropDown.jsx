import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { useLocation, useNavigate } from "react-router-dom";

function DropDown() {
    const location = useLocation();
    const loggedIn = location.state ? location.state.loggedIn : true;
    const navigate = useNavigate();

    const toDashboard = () => {
        navigate('/dashboard');
    }

    const toReminders = () => {
        navigate('/reminders');
    }

    const toLogOut = () => {
        navigate('/');
    }

    const toLogIn = () => {
        navigate('/login');
    }

    const toHistory = () => {
        navigate('/history');
    }

    function getMenuItems() {
        if (loggedIn) {
            return (
                <>
                    <Dropdown.Item onClick={() => toDashboard()}>Dashboard</Dropdown.Item>
                    <Dropdown.Item onClick={() => toReminders()}>Your Reminders</Dropdown.Item>
                    <Dropdown.Item onClick={() => toHistory()}>History</Dropdown.Item>
                    <Dropdown.Item onClick={() => toLogOut()}>Log Out</Dropdown.Item> 
                </>
            )
        } else {
            return (
                <>
                    <Dropdown.Item onClick={() => toLogIn()}>Log In</Dropdown.Item>
                </>
            )
        }
    }

    return (
        <Dropdown>
        <Dropdown.Toggle variant="outline-primary" size={window.innerWidth > 700? "lg" : "md"} id="dropdown-basic">
            User
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {getMenuItems()}
        </Dropdown.Menu>
        </Dropdown>
    );
}

export default DropDown;