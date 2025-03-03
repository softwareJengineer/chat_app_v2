import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import UserOptions from "./UserOptions";

function Header() {
	const location = useLocation();

	return (
		<div className='flex'>
			<p className="pt-[1em] pl-[1em] font-mono text-lg">AI Assistant Chat</p>
			<span className="float-right ml-auto mr-[1em] mt-[1em] space-x-[1em] flex flex-row">
				<Link to="/">
					<Button 
					variant={location.pathname === "/" ? "primary" : "outline-primary"}
					size={window.innerWidth > 700? "lg" : "md"}
					>
					Chat
					</Button>
				</Link> 
				<UserOptions />
			</span>
		</div>
	);
}

export default Header;