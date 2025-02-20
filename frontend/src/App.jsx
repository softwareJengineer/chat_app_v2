import React from "react";
import { Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Details from './pages/Details';
import NewEntry from "./pages/NewEntry";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <Routes>
          <Route exact path='/' element={<Chat/>}></Route>
          <Route path='/details' element={<Details/>}></Route>
          <Route path='/new' element={<NewEntry/>}></Route>
          <Route path='/dashboard' element={<Dashboard/>}></Route>
        </Routes>
    );
}

export default App;