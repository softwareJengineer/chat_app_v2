import React, { useState } from "react";
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Details from './pages/Details';
import NewEntry from "./pages/NewEntry";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Schedule from "./pages/Schedule";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import Home from "./pages/Home";

export const UserContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  
    return (
      <UserContext.Provider value={{ user: user, setUser: setUser }}>
          <Routes>
            <Route exact path='/' element={<Home/>}></Route>
            <Route path='/chat' element={<Chat/>}></Route>
            <Route path='/details' element={<Details/>}></Route>
            <Route path='/new' element={<NewEntry/>}></Route>
            <Route path='/dashboard' element={<Dashboard/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/signup' element={<SignUp/>}></Route>
            <Route path='/schedule' element={<Schedule/>}></Route>
            <Route path='/analysis' element={<Analysis/>}></Route>
            <Route path='/settings' element={<Settings/>}></Route>
          </Routes>
        </UserContext.Provider>
    );
}

export default App;