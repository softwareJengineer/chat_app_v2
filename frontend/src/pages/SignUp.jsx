import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { signup } from "../functions/apiRequests";

function SignUp() {
    const navigate = useNavigate();
    const inputStyling = "p-2 border-1 border-gray-400 rounded-md";

    const [formData, setFormData] = useState({
        plwdFirstName: '',
        plwdLastName: '',
        plwdUsername: '',
        plwdPassword: '',
        plwdConfirmPassword: '',
        caregiverFirstName: '',
        caregiverLastName: '',
        caregiverUsername: '',
        caregiverPassword: '',
        caregiverConfirmPassword: '',
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
        if (formData.plwdPassword !== formData.plwdConfirmPassword) {
            alert("PLwD passwords do not match.");
            return;
        } else if (formData.caregiverPassword !== formData.caregiverConfirmPassword) {
            alert("Caregiver passwords do not match.");
            return;
        }
        const response = await signup(formData);
        if (response) {
            alert("Sign up successful!");
            navigate('/login');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex h-[100vh] justify-center items-center">
                    <div className="flex flex-col w-4/5 md:w-1/2 m-[2rem]">
                        <h1 className="justify-center flex font-mono">Sign Up</h1>
                        <div className="flex flex-col gap-3 p-4">
                            <h3>Caregiver information:</h3>
                            <span className="flex flex-row gap-2">
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="caregiverFirstName"
                                    placeholder="First Name"
                                    value={formData.caregiverFirstName}
                                    onChange={handleChange}
                                    required
                                />
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="caregiverLastName"
                                    placeholder="Last Name"
                                    value={formData.caregiverLastName}
                                    onChange={handleChange}
                                    required
                                />
                            </span>
                            <input 
                                className={inputStyling} 
                                name="caregiverUsername"
                                placeholder="Username"
                                value={formData.caregiverUsername}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="caregiverPassword"
                                className={inputStyling} 
                                placeholder="Password"
                                value={formData.caregiverPassword}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="caregiverConfirmPassword"
                                className={inputStyling} 
                                placeholder="Confirm Password"
                                value={formData.caregiverConfirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <h3>PLwD information:</h3>
                            <span className="flex flex-row gap-2">
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="plwdFirstName"
                                    placeholder="First Name"
                                    value={formData.plwdFirstName}
                                    onChange={handleChange}
                                    required
                                />
                                <input 
                                    className={"w-1/2 " + inputStyling} 
                                    name="plwdLastName"
                                    placeholder="Last Name"
                                    value={formData.plwdLastName}
                                    onChange={handleChange}
                                    required
                                />
                            </span>
                            <input 
                                className={inputStyling} 
                                name="plwdUsername"
                                placeholder="Username"
                                value={formData.plwdUsername}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="plwdPassword"
                                className={inputStyling} 
                                placeholder="Password"
                                value={formData.plwdPassword}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                type="password" 
                                name="plwdConfirmPassword"
                                className={inputStyling} 
                                placeholder="Confirm Password"
                                value={formData.plwdConfirmPassword}
                                onChange={handleChange}
                                required
                            />
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