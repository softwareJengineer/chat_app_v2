import React, { useContext, useState } from "react"
import AuthContext from '../context/AuthContext';
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Home() {
    const {user} = useContext(AuthContext);

    const navigate = useNavigate();

    const toLogin = () => {
        navigate("/login");
    }

    const toSignUp = () => {
        navigate("/signup");
    }

    return (
        <div className="flex flex-col justify-center items-center h-[100vh] gap-5">
            <Header/>
            <h1 className="font-mono text-lg">AI Assistant Chat</h1>
            <div className="flex flex-col gap-4 border-1 border-gray-300 rounded-lg p-[3rem] md:w-1/2">
                <Button size="lg" variant="outline-primary" onClick={toLogin}>Login</Button>
                <Button size="lg" variant="primary" onClick={toSignUp}>Sign Up</Button>
            </div>
        </div>
    );
}

export default Home;