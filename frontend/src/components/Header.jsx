import React, { Component, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Header() {
  
	const [width, setWidth] = React.useState(window.innerWidth);
	const breakpoint = 700;

	useEffect(() => {
		const handleResizeWindow = () => setWidth(window.innerWidth);
			window.addEventListener("resize", handleResizeWindow);
		return () => {
			window.removeEventListener("resize", handleResizeWindow);
		};
	}, []);

	let location = useLocation();

	if (width > breakpoint) {
		return (
			<div className='flex'>
				<p className="pt-[1em] pl-[1em] font-mono text-lg">AI Assistant Chat</p>
				<span className="float-right ml-auto mr-[1em] mt-[1em] space-x-[1em]">
				<Link to="/">
					<Button 
					variant={location.pathname === "/" ? "primary" : "outline-primary"}
					size="lg"
					>
					Chat
					</Button>
				</Link> 
				<Link to="/dashboard">
					<Button 
					variant={location.pathname === "/dashboard" ? "primary" : "outline-primary"}
					size="lg"
					>
					Dashboard
					</Button>
				</Link>
				</span>
			</div>
		);
	} else {
		return (
			<div className='flex'>
				<p className="pt-[1em] pl-[1em] font-mono text-lg">AI Assistant Chat</p>
				<span className="float-right ml-auto mr-[1em] mt-[1em] space-x-[1em]">
				<Link to="/">
					<Button 
					variant={location.pathname === "/" ? "primary" : "outline-primary"}
					size="md"
					>
					Chat
					</Button>
				</Link> 
				<Link to="/dashboard">
					<Button 
					variant={location.pathname === "/dashboard" ? "primary" : "outline-primary"}
					size="md"
					>
					Dashboard
					</Button>
				</Link>
				</span>
			</div>
		)
	}
}

export default Header;