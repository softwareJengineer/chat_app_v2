import React, { useContext } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../App';

function UserOptions() {
    const { user, setUser } = useContext(UserContext);

    const isCaregiver = user?.role === "Caregiver";
    const navigate = useNavigate();

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

    function getMenuItems() {
        return (
            <>
                {isCaregiver ? 
                    <Dropdown.Item onClick={toHistory}>History</Dropdown.Item> : 
                    <Dropdown.Item onClick={toDashboard}>Dashboard</Dropdown.Item>
                }
                <Dropdown.Item onClick={() => toSchedule()}>Schedule</Dropdown.Item>
                <Dropdown.Item onClick={() => toSettings()}>Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => toLogOut()}>Log Out</Dropdown.Item> 
            </>
        )

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

export default UserOptions;