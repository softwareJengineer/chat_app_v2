import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({children}) => {
    let { authTokens, profile, setProfile, setSettings, setGoal, logoutUser } = useContext(AuthContext);

    useEffect(() => {
        if (!profile) {
            getProfile();
        }
    }, [])

    const getProfile = async () => {
        let response = await fetch('http://localhost:8000/api/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + String(authTokens.access)
        }
        })
        let data = await response.json()
        if (data.success) {
            setProfile({
                plwdFirstName: data.plwdFirstName,
                plwdLastName: data.plwdLastName,
                plwdUsername: data.plwdUsername,
                caregiverFirstName: data.caregiverFirstName,
                caregiverLastName: data.caregiverLastName,
                caregiverUsername: data.caregiverUsername,
                role: data.role
            });
            setSettings(data.settings);
            setGoal(data.goal);
        } else if(response.statusText === 'Unauthorized') {
            logoutUser();
        } else {
            alert(data.error);
            logoutUser();
        }
    }

    if (!authTokens && !localStorage.getItem('authTokens')) {
        return <Navigate to="/login" replace />;
    } else {
        return (profile ? children : <div className="flex items-center justify-center h-screen w-screen text-xl">Loading...</div>);
    }
}

export default PrivateRoute;