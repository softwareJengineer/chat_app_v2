import React from "react";
import Header from "../components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";


function Login() {
    const navigate = useNavigate();

    const toSignup = () => {
        navigate('/signup');
    }
    
    return (
        <>
            <Header/>
            <div className="flex justify-center items-center">
                <div className="flex flex-col md:w-1/2 w-4/5 m-[2rem]">
                    <p className="justify-center flex text-xl font-mono">Log In</p>
                    <div className="flex flex-col gap-2 border-1 border-gray-400 rounded-lg p-4">
                        <label>Username</label>
                        <input className="p-2 border-b-1 border-gray-400"></input>
                        <label>Password</label>
                        <input className="p-2 border-b-1 border-gray-400"></input>
                        <Button variant="primary">Log In</Button>
                    </div>
                    <p>Don't have an account? <a className="hover:cursor-pointer" onClick={() => toSignup()}>Sign Up</a></p>
                </div>
            </div>
        </>
    );
}

export default Login;