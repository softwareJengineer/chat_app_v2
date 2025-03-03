import React from "react";
import Header from "../components/Header";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigate = useNavigate();
    const inputStyling = "p-2 border-1 border-gray-400 rounded-md";

    function toLogin() {
        navigate('/login');
    }

    return (
        <>
            <Header/>
            <form>
                <div className="flex justify-center items-center">
                    <div className="flex flex-col w-4/5 md:w-1/2 m-[2rem]">
                        <p className="justify-center flex text-xl font-mono">Sign Up</p>
                        <div className="flex flex-col gap-3 rounded-lg p-4">
                            <span className="flex flex-row gap-2">
                                <input className={"w-1/2 " + inputStyling} placeholder="First Name"></input>
                                <input className={"w-1/2 " + inputStyling} placeholder="Last Name"></input>
                            </span>
                            <input className={inputStyling} placeholder="email@example.com">
                            </input>
                            <input className={inputStyling} placeholder="Username"></input>
                            <input type="password" className={inputStyling} placeholder="Password"></input>
                            <input type="password" className={inputStyling} placeholder="Confirm Password"></input>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50" required />
                                </div>
                                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the terms and conditions.</label>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <label>I am a:</label>
                                <select name="role" id="role" className={inputStyling}>
                                    <option value="" disabled selected>Select One</option>
                                    <option value="patient">Patient</option>
                                    <option value="caregiver">Caregiver</option>
                                </select>
                            </div>
                            <Button variant="primary">Sign Up</Button>
                            <p>Already have an account? <a className="hover:cursor-pointer" onClick={() => toLogin()}>Log In</a></p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default SignUp;