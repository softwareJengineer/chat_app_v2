import React from "react";
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import NewEntry from "./pages/NewEntry";

function App() {
    return (
        <Routes>
          <Route exact path='/' element={<Chat/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
          <Route path='/new' element={<NewEntry/>}></Route>
        </Routes>
    );
}

export default App;