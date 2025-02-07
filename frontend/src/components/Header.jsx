import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Header() {
  let location = useLocation();
    return (
      <div className='flex'>
       <p className="pt-[1em] pl-[1em] font-mono text-lg">AI Assistant Chat</p>
        <span className="float-right ml-auto mr-[1em] mt-[1em] space-x-[1em]">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "primary" : "outline-primary"}>Chat</Button>
          </Link> 
          <Link to="/dashboard">
            <Button variant={location.pathname === "/dashboard" ? "primary" : "outline-primary"}>Dashboard</Button>
          </Link>
        </span>
      </div>
    );
}

export default Header;