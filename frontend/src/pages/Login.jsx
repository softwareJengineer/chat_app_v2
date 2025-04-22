import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { UserContext } from "../App";
import { login } from "../functions/apiRequests";


function Login() {
    const { setUser, setSettings, setReminders, setChats } = useContext(UserContext);
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
        const response = await login(formData);
        const { user, settings } = response;
        setUser(user);
        setSettings(settings);

        if (user.role === 'Patient') {
            navigate('/chat');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex h-[100vh] justify-center items-center">
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