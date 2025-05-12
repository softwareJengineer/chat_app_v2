import React, { useEffect, useContext, useState } from "react"
import AuthContext from '../context/AuthContext';
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getRecentChat } from "../functions/apiRequests";

function Today() {
    const {profile, authTokens} = useContext(AuthContext);
    const [chatData, setChatData] = useState(null);
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChat = async () => {
            const userChats = await getRecentChat(authTokens);
            if (userChats) {
                setChatData(userChats);
                setDate(new Date(userChats.date));
            } else {

            }
        };

        fetchChat();
    }, []);

    const style = new Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })

    const toDetails = () => {
        navigate("/details", {state: {chatData: chatData}});
    }

    if (chatData) {
        return (
        <>
            <Header title="Today's Speech Analysis" page="today"/>
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50}/>
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                </div>
            </div>
            <div className="m-[2rem] flex flex-col gap-4">
                <span className="flex flex-row gap-5">
                    <p className="text-3xl font-semibold">Conclusion of the Speech</p>
                    <p className="flex align-middle justify-center font-black text-3xl">{style.format(date)}</p>
                </span>
                <p>Here would be a summary of today's conversation. It would include topics talked about, sentiment of the conversation, and more.</p>
                <p className="text-3xl font-semibold">Conversation Analysis</p>
                <p>Here would be an analysis of today's speech and how well you are doing in several biomarkers. For example, if you were doing
                    very well in turn taking, we would give praise. If you had a biomarker to work on, we would give suggestions on how to improve.
                </p>
                <p className="text-3xl font-semibold">How to Keep It Up</p>
                <p>Here would be some suggestions of activities to keep healthy and active. For example, spending time outdoors, connecting
                    with friends, etc.
                </p>
            </div>
        </>)
    } else {
        return (
            <>
                <Header title="Today's Speech Analysis" page="today"/>
                <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                    <div className="flex items-center gap-4 align-middle">
                        <FaUser size={50}/>
                        <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                    </div>
                </div>
                <div className="flex m-[2rem]">
                    No data to display.
                </div>
        </>
        )
    }
}

export default Today;