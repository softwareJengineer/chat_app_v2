import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { signup } from "../functions/apiRequests";

function SignUp() {
    const navigate = useNavigate();
    const inputStyling = "p-2 border-1 border-gray-400 rounded-md";

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });

    const toLogin = () => {
        navigate('/login');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        const response = await signup(formData);
        if (response) navigate('/login');
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex h-[100vh] justify-center items-center">
                    <div className="flex flex-col w-4/5 md:w-1/2 m-[2rem]">
                        <p className="justify-center flex text-xl font-mono">Sign Up</p>
                        <div className="flex flex-col gap-3 rounded-lg p-4">
                            <span className="flex flex-row gap-2">
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </span>
                            <input 
                                className={inputStyling} 
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                className={inputStyling} 
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="password"
                                className={inputStyling} 
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="confirmPassword"
                                className={inputStyling} 
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <div className="flex flex-row gap-2 items-center">
                                <label>I am a:</label>
                                <select
                                    name="role"
                                    id="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className={inputStyling}
                                    required
                                >
                                    <option value="" disabled>Select One</option>
                                    <option value="Patient">PLwD</option>
                                    <option value="Caregiver">Caregiver</option>
                                </select>
                            </div>
                            <Button type="submit" variant="primary">Sign Up</Button>
                            <p>Already have an account? <a className="hover:cursor-pointer" onClick={() => toLogin()}>Log In</a></p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default SignUp;