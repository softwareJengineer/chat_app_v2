import React from "react";
import Header from "../components/Header";
import { Button } from "react-bootstrap";

function SignUp() {
    return (
        <>
            <Header/>
            <form>
                <div className="flex justify-center items-center">
                    <div className="flex flex-col w-4/5 md:w-1/2 m-[2rem]">
                        <p className="justify-center flex text-xl font-mono">Sign Up</p>
                        <div className="flex flex-col gap-3 rounded-lg p-4">
                            <span className="flex flex-row gap-2">
                                <input className="w-1/2 p-2 border-1 border-gray-400 rounded-md" placeholder="First Name"></input>
                                <input className="w-1/2 p-2 border-1 border-gray-400 rounded-md" placeholder="Last Name"></input>
                            </span>
                            <input className="p-2 border-1 border-gray-400 rounded-md" placeholder="email@example.com">
                            </input>
                            <input className="p-2 border-1 border-gray-400 rounded-md" placeholder="Username"></input>
                            <input type="password" className="p-2 border-1 border-gray-400 rounded-md" placeholder="Password"></input>
                            <input type="password" className="p-2 border-1 border-gray-400 rounded-md" placeholder="Confirm Password"></input>
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                <input id="remember" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50" required />
                                </div>
                                <label for="remember" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the terms and conditions.</label>
                            </div>
                            <Button variant="primary">Sign Up</Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default SignUp;