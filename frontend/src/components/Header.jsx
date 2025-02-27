import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Header() {
	const [width, setWidth] = useState(window.innerWidth);
	const [loggedIn, setLoggedIn] = useState(false);

	const location = useLocation();
	const breakpoint = 700;

	useEffect(() => {
		const handleResizeWindow = () => setWidth(window.innerWidth);
			window.addEventListener("resize", handleResizeWindow);
		return () => {
			window.removeEventListener("resize", handleResizeWindow);
		};
	}, []);

	function checkLoggedIn() {
		if (loggedIn) {
			return (
				<Link to="/dashboard">
					<Button 
					variant={location.pathname === "/dashboard" ? "primary" : "outline-primary"}
					size={window.innerWidth > breakpoint ? "lg" : "md"}
					>
					Dashboard
					</Button>
				</Link>
			)
		} else {
			return (
				<Link to="/login">
					<Button 
					variant={location.pathname === "/login" ? "primary" : "outline-primary"}
					size={window.innerWidth > breakpoint ? "lg" : "md"}
					>
					Log In
					</Button>
				</Link>
			)
		}
	}

	return (
		<div className='flex'>
			<p className="pt-[1em] pl-[1em] font-mono text-lg">AI Assistant Chat</p>
			<span className="float-right ml-auto mr-[1em] mt-[1em] space-x-[1em]">
			<Link to="/">
				<Button 
				variant={location.pathname === "/" ? "primary" : "outline-primary"}
				size={window.innerWidth > breakpoint? "lg" : "md"}
				>
				Chat
				</Button>
			</Link> 
			{checkLoggedIn()}
			</span>
		</div>
	);
}

export default Header;