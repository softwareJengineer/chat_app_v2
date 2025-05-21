import React from 'react';
import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({children}) => {
    let { profile } = useContext(AuthContext);
    if (profile) {return children;                            } 
    else         {return (<Navigate to='/' replace={true} />);}
}

export default PrivateRoute;