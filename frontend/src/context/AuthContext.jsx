import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {

    let [user, setUser] = useState(() => (localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null));
    let [authTokens, setAuthTokens] = useState(() => (localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null));
    let [loading, setLoading] = useState(true);
    let [settings, setSettings] = useState();
    let [profile, setProfile] = useState();
    let [goal, setGoal] = useState();

    const navigate = useNavigate()

    let loginUser = async (formData) => {
        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        let data = await response.json();

        if(data && response.ok) {
            localStorage.setItem('authTokens', JSON.stringify(data));
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            navigate('/loading');
        } else {
            alert(data.error);
        }
    }

    let logoutUser = () => {
        localStorage.removeItem('authTokens')
        setAuthTokens(null)
        setUser(null)
        navigate('/')
    }

    // const updateToken = async () => {
    //     const response = await fetch('http://localhost:8000/api/token/refresh/', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body:JSON.stringify({refresh:authTokens?.refresh})
    //     })
       
    //     const data = await response.json()
    //     if (response.status === 200) {
    //         setAuthTokens(data)
    //         setUser(jwtDecode(data.access))
    //         localStorage.setItem('authTokens',JSON.stringify(data))
    //     } else {
    //         logoutUser()
    //     }

    //     if(loading){
    //         setLoading(false)
    //     }
    // }

    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        profile: profile,
        setProfile: setProfile,
        settings: settings,
        setSettings: setSettings,
        goal: goal,
        setGoal: setGoal,
    }

    // useEffect(()=>{
    //     if(loading){
    //         updateToken()
    //     }

    //     const REFRESH_INTERVAL = 1000 * 60 * 15 // 4 minutes
    //     let interval = setInterval(() => {
    //         if (authTokens) {
    //             updateToken()
    //         }
    //     }, REFRESH_INTERVAL)
    //     return () => clearInterval(interval)

    // }, [authTokens, loading])

    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}
