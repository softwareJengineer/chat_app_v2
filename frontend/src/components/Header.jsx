import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from '../context/AuthContext';
import { GoGear, GoGraph } from "react-icons/go";
import { GrSchedules } from "react-icons/gr";
import { IoExitOutline } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";


const Header = ({title, page}) => {
	const { profile, logoutUser } = useContext(AuthContext);
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

	const getStyle = (page, targetPage) => {
		if (page === targetPage) {
			return "text-blue-700 underline";
		} else {
			return "text-gray-700 no-underline"
		}
 	}	

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
			<div className="float flex flex-row m-[2rem]">
                <p className="text-5xl font-semibold">{title}</p>
                <div className="float-right flex ml-auto gap-4">
					<Link className="flex align-middle" style={{textDecoration: 'none'}} to="/chat">
						<button className={getStyle(page, 'chat')}>Chat</button>
					</Link>
					<Link className="flex align-middle" style={page==="today" ? {} : {textDecoration: 'none'}} to="/today">
						<button className={getStyle(page, 'today')}>Today's Speech Analysis</button>
					</Link>
                    <Link className="flex align-middle" style={page==="history" ? {} : {textDecoration: 'none'}} to='/history'>
                        <button className={getStyle(page, 'history')}>Chat History</button>
                    </Link>
                    <Link className="flex align-middle" style={page==="schedule" ? {} : {textDecoration: 'none'}} to='/schedule'>
                        <button className={getStyle(page, 'schedule')}>Schedule</button>
                    </Link>
                    <button className="flex bg-blue-700 rounded h-fit p-2 text-white self-center" onClick={() => logoutUser()}>Log Out</button>
                </div>  
            </div>
		</>
		)
	}
}

export default Header;