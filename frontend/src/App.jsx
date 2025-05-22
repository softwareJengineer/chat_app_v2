import React from "react";
import { Routes, Route } from 'react-router-dom';
import { AuthProvider  } from './context/AuthContext';

import PrivateRoute    from './utils/PrivateRoute';
import Chat            from './pages/Chat';
import Login           from "./pages/Login";
import SignUp          from "./pages/SignUp";
import Schedule        from "./pages/Schedule";
import Dashboard       from "./pages/Dashboard";
import Settings        from "./pages/Settings";
import Home            from "./pages/Home";
import ChatDetails     from "./pages/ChatDetails";
import ChatHistory     from "./pages/ChatHistory";
import Analysis        from "./pages/Analysis";
import LoadingPage     from "./pages/LoadingPage";
import Today           from "./pages/Today";
import ProgressSummary from "./pages/ProgressSummary";

function App() {    
    return (
    <AuthProvider>
        <Routes>
            <Route exact path='/'       element={               <Home           />                }></Route>
            <Route path='/login'        element={               <Login          />                }></Route>
            <Route path='/signup'       element={               <SignUp         />                }></Route>
            <Route path='/loading'      element={               <LoadingPage    />                }></Route>
            <Route path='/chat'         element={<PrivateRoute> <Chat           /> </PrivateRoute>}></Route>
            <Route path='/progress'     element={<PrivateRoute> <ProgressSummary/> </PrivateRoute>}></Route>
            <Route path='/dashboard'    element={<PrivateRoute> <Dashboard      /> </PrivateRoute>}></Route>
            <Route path='/schedule'     element={<PrivateRoute> <Schedule       /> </PrivateRoute>}></Route>
            <Route path='/settings'     element={<PrivateRoute> <Settings       /> </PrivateRoute>}></Route>
            <Route path='/chatdetails'  element={<PrivateRoute> <ChatDetails    /> </PrivateRoute>}></Route>
            <Route path="/history"      element={<PrivateRoute> <ChatHistory    /> </PrivateRoute>}></Route>
            <Route path="/analysis"     element={<PrivateRoute> <Analysis       /> </PrivateRoute>}></Route>
            <Route path='/today'        element={<PrivateRoute> <Today          /> </PrivateRoute>}></Route>
        </Routes>
    </AuthProvider>
    );
}

export default App;