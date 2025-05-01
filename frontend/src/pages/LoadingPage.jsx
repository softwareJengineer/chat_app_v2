import React, { useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoadingPage = () => {
    const { authTokens, logoutUser, profile, setProfile, setSettings } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        getProfile()
    },[])

    const getProfile = async () => {
        let response = await fetch('http://localhost:8000/api/profile', {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + String(authTokens.access)
        }
        })
        let data = await response.json()
        console.log(data)
        if(response.status === 200){
            setProfile({
                plwdFirstName: data.plwdFirstName,
                plwdLastName: data.plwdLastName,
                plwdUsername: data.plwdUsername,
                caregiverFirstName: data.caregiverFirstName,
                caregiverLastName: data.caregiverLastName,
                caregiverUsername: data.caregiverUsername,
                role: data.role
            });
            setSettings(JSON.parse(data.settings));
            if (data.role === 'Patient') {
                navigate('/chat');
            } else {
                navigate('/dashboard')
            }
        } else if(response.statusText === 'Unauthorized') {
            logoutUser()
        }
    }

    if (profile) {
        return null;
    } else {
        return (
            <div className="flex items-center justify-center h-screen w-screen text-xl">
                Logging user in...
            </div>
        )
    }
}

export default LoadingPage;