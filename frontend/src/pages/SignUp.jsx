import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Header from "../components/Header";

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                navigate('/login');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    return (
        <>
            <Header/>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center items-center">
                    <div className="flex flex-col md:w-1/2 w-4/5 m-[2rem]">
                        <p className="justify-center flex text-xl font-mono">Sign Up</p>
                        <div className="flex flex-col gap-2 border-1 border-gray-400 rounded-lg p-4">
                            <label>Username</label>
                            <input 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="p-2 border-b-1 border-gray-400"
                            />
                            <label>Email</label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="p-2 border-b-1 border-gray-400"
                            />
                            <label>Password</label>
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="p-2 border-b-1 border-gray-400"
                            />
                            <Button type="submit" variant="primary">Sign Up</Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default SignUp;