import { useNavigate } from "react-router-dom";
import {  ChatSession } from "@/api";

// Button that sends users to the transcript analysis page
// ToDo: Try with other colors
export default function AnalysisButton ({ session, analysis_choice } : { session: ChatSession, analysis_choice: string }) {
    const navigate = useNavigate();
    const onClick = () => navigate("/analysis", { state: { session, analysis_choice } });
    
    const buttStyle = "bg-violet-600 rounded p-2 text-white";

    return <button className={buttStyle} onClick={onClick}> View in Transcript </button>;
}
