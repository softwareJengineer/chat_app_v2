import { useNavigate, useLocation } from "react-router-dom";
import { ChatSession } from "@/api";

import { dateFormatLong } from "@/utils/styling/numFormatting";
import { PATIENT_HEX    } from "@/utils/styling/colors";

import ProfileBar       from "@/components/user-info/ProfileBar";
import ChatOverview     from "@/components/details/ChatOverview";
import RadarTrack       from "@/components/details/RadarTrack";
import DetailedAnalysis from "@/components/details/DetailedAnalysis";


import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { getSessionsBefore, averageScore } from "@/utils/misc/scores";


// --------------------------------------------------------------------
// ChatDetails
// --------------------------------------------------------------------
// ToDo: It's all inside a grid?
// Radar track/recommended activities
export default function ChatDetails () {
    // If the page wasn't loaded with a ChatSession, reroute
    const { state } = useLocation() as { state?: { chatSession?: ChatSession } };
    if (!state?.chatSession) { useNavigate()("/dashboard"); };
    const chatDate = new Date(state?.chatSession.date);

    // Previous average scores
    const { data, isLoading } = useChatSessions();
    const prevScores = averageScore(getSessionsBefore(data, chatDate));

    //const outerStyle = "grid md:grid-cols-2 grid-cols-1 h-full justify-stretch mx-[2rem] items-center gap-4 mb-[2rem]";
    const outerStyle = "flex flex-col";

    // Return UI Component
    if (isLoading) { return <p>Loading chat history...</p>; }
    return (
    <div className={outerStyle}>
        <ProfileBar/>
        {chatOverview(dateFormatLong.format(chatDate))}
        

        <div className="flex flex-col mx-[1rem]">

            <div className="flex gap-4"> 
                <div className="w-1/2"> <ChatOverview chatSession={ state?.chatSession } /> </div>
                <div className="w-1/2"> <RadarTrack current={ state?.chatSession.average_scores} previous={prevScores}/> </div>
            </div>

            <DetailedAnalysis session={ state?.chatSession } />

        </div>
    </div>
    );
}


// Header Helper (ToDo: Try it with a different color)
function chatOverview(chatDate: string) {
    const dateStyle = "text-purple-500 text-4xl";
    return (
        <div className="flex flex-row mx-[1rem] mb-[1rem] gap-4">
            <b className="text-4xl"> Single Chat Analysis: </b>
            <b className={dateStyle}>{chatDate}</b>
        </div>
    );
}
