import { useNavigate, useLocation } from "react-router-dom";
import { IoIosChatbubbles         } from "react-icons/io";

import { ChatSession                     } from "@/api";
import { useChatSessions                 } from "@/hooks/queries/useChatSessions";
import { getSessionsBefore, averageScore } from "@/utils/misc/scores";
import { dateFormatLong                  } from "@/utils/styling/numFormatting";

import ProfileBar       from "@/components/user-info/ProfileBar";
import RadarTrack       from "@/components/details/RadarTrack";
import DetailedAnalysis from "@/components/details/DetailedAnalysis";
import ChatTranscript   from "@/pages/chatDetails/components/ChatTranscript";
import ChatBiomarkers   from "@/pages/chatDetails/components/ChatBiomarkers";


// ====================================================================
// ChatDetails
// ====================================================================
export function ChatDetails () {
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
                <div className="w-1/2"> <ChatBiomarkers chatSession={state?.chatSession}                prevScores={prevScores} /> </div>
                <div className="w-1/2"> <RadarTrack     current    ={state?.chatSession.average_scores} previous  ={prevScores} /> </div>
            </div>

            <ChatTranscript chatSession={state?.chatSession}/>

            <DetailedAnalysis session={ state?.chatSession } />

        </div>
    </div>
    );
}

// --------------------------------------------------------------------
// Header Helper
// --------------------------------------------------------------------
function chatOverview(chatDate: string) {
    const dateStyle = "text-violet-600 text-4xl";
    return (
        <div className="flex flex-row items-center mx-[1rem] mb-[1rem] gap-[1rem] mt-[1rem]">
            <IoIosChatbubbles size={40} />
            <b className={dateStyle}>{chatDate}</b>
        </div>
    );
}
