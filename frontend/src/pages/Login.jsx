import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { UserContext } from "../App";
import Header from "../components/Header";

function Login() {
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
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
            const response = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setUser({
                    username: data.username,
                    email: data.email,
                    role: data.role,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    settings: data.settings
                });
                navigate('/dashboard');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <>
            <Header/>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-center items-center">
                    <div className="flex flex-col md:w-1/2 w-4/5 m-[2rem]">
                        <p className="justify-center flex text-xl font-mono">Log In</p>
                        <div className="flex flex-col gap-2 border-1 border-gray-400 rounded-lg p-4">
                            <label>Username</label>
                            <input 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="p-2 border-b-1 border-gray-400"
                                required
                            />
                            <label>Password</label>
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="p-2 border-b-1 border-gray-400"
                                required
                            />
                            <Button type="submit" variant="primary">Log In</Button>
                        </div>
                        <p>Don't have an account? <a className="hover:cursor-pointer" onClick={() => navigate('/signup')}>Sign Up</a></p>
                    </div>
                </div>
            </form>
        </>
    );
}

export default Login;