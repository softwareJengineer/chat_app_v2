import React from "react";
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Details from './pages/Details';
import NewEntry from "./pages/NewEntry";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Reminders from "./pages/Reminders";
import History from "./pages/History"

function App() {
    return (
        <Routes>
          <Route exact path='/' element={<Chat/>}></Route>
          <Route path='/details' element={<Details/>}></Route>
          <Route path='/new' element={<NewEntry/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/signup' element={<SignUp/>}></Route>
          <Route path='/reminders' element={<Reminders/>}></Route>
          <Route path='/history' element={<History/>}></Route>
        </Routes>
    );
}

export default App;