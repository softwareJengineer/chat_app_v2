import React, { useContext, useState } from "react"
import AuthContext from '../context/AuthContext';
import { Link, useLocation, useNavigate } from "react-router-dom";
import ChatLog from "../components/ChatLog";
import Descriptions from "../data/descriptions.json";
import Header from "../components/Header";

function Analysis() {
    const {profile} = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const chatData = location.state.chatData;
    const [biomarker, setBiomarker] = useState(location.state.biomarker ? location.state.biomarker : "Pragmatic");

    const toHistory = () => {
        navigate('/history');
    }

    const toToday = () => {
        navigate('/today', {state: {chatData: chatData}})
    }

    const date = new Date(chatData.date);
    const style = new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })

    return (
        <>
            <Header title="Speech Analysis" page="analysis" />
            <div className="m-[2rem]">
                <p className="text-4xl text-purple-500 font-semibold">{style.format(date)}</p>
                <label className="text-xl">
                    Select a biomarker:
                    <select 
                        value={biomarker} 
                        onChange={e => setBiomarker(e.target.value)}
                        className="mx-2 my-4 border-1 border-black-500 rounded p-1"
                    >
                        <option value="Pragmatic">Pragmatic</option>
                        <option value="Anomia">Anomia</option>
                        <option value="Prosody">Prosody</option>
                        <option value="Pronunciation">Pronunciation</option>
                        <option value="Turn Taking">Turn Taking</option>
                        <option value="Grammar">Grammar</option>
                    </select>
                </label>
                <p className="font-bold">Biomarker definition:</p>
                <p>{Descriptions[biomarker].description}</p>
                <p className="font-bold">Chat Analysis:</p>
                <p>Here would be the analysis of your conversation with respect to the selected biomarker. For example, if you had selected
                    turn taking, we would point out places where you took turns well and where you could improve.
                </p>
                <ChatLog messages={chatData.messages} firstName={profile.plwdFirstName} lastName={profile.plwdLastName}/>
            </div>
        </>
    )
}

export default Analysis;