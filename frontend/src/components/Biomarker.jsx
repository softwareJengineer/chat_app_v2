import { useNavigate } from 'react-router-dom';
import { cardStyle, buttStyle } from "@/utils/styling/sharedStyles";

// --------------------------------------------------------------------
// Helper Function
// --------------------------------------------------------------------
function getImprovement(current, prev) {
    const diff  = current - prev;
    const score = Math.abs(Math.round(diff * 1000) / 10);
    const styles = {Improved: { color: "bg-green-500", sign: "+", label: "Improved" },
                    Declined: { color: "bg-red-500",   sign: "-", label: "Declined" },
                    Steady:   { color: "bg-gray-300",  sign: "+", label: "Steady"   }, };

    const { color, sign, label } =
        diff > 0 ? styles.Improved :
        diff < 0 ? styles.Declined :
                   styles.Steady;

    return (
        <div className="flex flex-row gap-3 items-center">
            <p className={`rounded-full ${color} p-2 size-[3rem] aspect-square items-center justify-center flex font-bold`}>{sign}{score}</p>
            <p className="font-bold">{label}</p>
        </div>
    );
}

// ====================================================================
// Biomarker Card UI Component
// ====================================================================
export default function Biomarker({ name, chatData, prevChatData }) {
    // Per-biomarker configuration
    const navigate = useNavigate();
    const onClick  = () => navigate('/analysis', {state: {chatData: chatData, biomarker: name}});
    const cardText = `Here would be an overview of the ${name} analysis.`;

    // Return a UI component
    return (
        <> 
            <div className={cardStyle}>
                <h4> {name} Review </h4>
                {getImprovement(chatData.avgScores[name], prevChatData.avgScores[name])}
                <p>{cardText}</p>
                <button className={buttStyle} onClick={onClick}> View in Transcript </button>
            </div>
        </>
    );
}
