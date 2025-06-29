import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

import { GoGear        } from "react-icons/go";
import { IoExitOutline } from "react-icons/io5";

import { useAuth } from "@/context/AuthProvider";
import   GoalModal from "@/components/modals/GoalModal";
import { navLinkCls } from "@/utils/styling/colors";

// Page title
const TITLES: Record<string, string> = {
    "/"         : "Dashboard",
    "/dashboard": "Dashboard",
    "/chat"     : "Chat",
    "/history"  : "Chat History",
    "/schedule" : "Schedule",
    default     : "Cognibot",
};

// --------------------------------------------------------------------
// Header
// --------------------------------------------------------------------
export default function Header() {
    const { logout } = useAuth();
    const { pathname } = useLocation();
    const [showModal, setShowModal] = useState(false);

    const title = TITLES[pathname] ?? TITLES.default;

    const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    isActive
        ? "underline decoration-2 text-violet-600"
        : "no-underline text-gray-500 hover:text-gray-700 visited:text-gray-500";


    const logOutStyle = "flex items-center gap-2 rounded bg-violet-600 px-3 py-1 text-white hover:bg-violet-700";

    return (
        <>
        <header className="flex items-center gap-6 px-6 py-3 shadow">
            <h1 className="text-2xl font-semibold whitespace-nowrap"> {title} </h1>
            <div className="ml-auto flex items-center gap-3">

                {/* Navigation Links */}
                <nav className="flex gap-4">
                    <NavLink to="/" end      className={({ isActive }) => linkCls(isActive)}> Dashboard </NavLink>
                    <NavLink to="/dashboard" className={({ isActive }) => linkCls(isActive)}> Dashboard </NavLink>
                    <NavLink to="/chat"      className={navLinkCls}> Chat      </NavLink>
                    <NavLink to="/history"   className={navLinkCls}> History   </NavLink>
                    <NavLink to="/schedule"  className={navLinkCls}> Schedule  </NavLink>
                </nav>

                {/* Right Side Icons */}
                <button onClick={() => setShowModal(true)}> <GoGear size={22}/> </button>
                <button onClick={() => logout()} className={logOutStyle}> <IoExitOutline size={18}/> Log out</button>
            </div>
        </header>

        {/* Modal */}
        <GoalModal show={showModal} onHide={() => setShowModal(false)} />
        </>
    );
}


function linkCls(active: boolean) {
    return active
        ? "text-violet-600 underline hover:text-purple-900"
        : "text-gray-400 hover:text-gray-600 hover:underline";
}













/*


import { useNavigate, Link } from "react-router-dom";



const Header = ({title, page}) => {
	const { profile, authTokens, logoutUser, goal, setGoal } = useContext(AuthContext);
	const [showModal, setShowModal] = useState(false);
	const [newStartDate, setStartDate] = useState(goal.startDay);
	const [newTarget, setNewTarget] = useState(goal.target);
	const isCaregiver = profile.role !== "Patient";
	const navigate = useNavigate();




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
							onClick={toSettings}
							className="px-2"
						>
							<GoGear size={25} style={{ marginRight: '2px' }}/>
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

					<Link className={page=="progress" ? "plwd-link-active" : "plwd-link-inactive"} to="/progress">
						Progress Summary
					</Link>
					<Link className={page=="today" ? "plwd-link-active" : "plwd-link-inactive"} to="/today">
						Review Today
					</Link>
     

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

*/