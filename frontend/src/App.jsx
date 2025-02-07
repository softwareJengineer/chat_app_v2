import React from "react";
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <Routes>
          <Route exact path='/' element={<Chat/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
        </Routes>
    );
}

export default App;