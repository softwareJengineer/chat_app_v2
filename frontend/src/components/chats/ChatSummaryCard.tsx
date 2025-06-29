import { ChatSession } from "@/api";
import { useNavigate } from "react-router-dom";


// --------------------------------------------------------------------
// Overall Condition
// --------------------------------------------------------------------
function overallCondition() {
    // ToDo: Finish this function for this section of the card
    const compared = {
        "improved": ["Anomia", "Turntaking"],
        "declined": ["Pragmatic", "Prosody"],
        "steady"  : ["Pronunciation", "AlteredGrammar"],
    };
    const suggested = ["Mad Libs", "Word Matching"];

    return (
    <>    
        <br/>
        <div><b>Overall Condition:</b></div>
        <div><b className="text-green-500"> Improved      </b> in {compared.improved.join(", ")}</div>
        <div><b className="text-red-500"  > Declined      </b> in {compared.declined.join(", ")}</div>
        <div><b className="text-gray-500" > Stayed steady </b> in {compared  .steady.join(", ")}</div>
        <br/>
        <div><b>Suggested activities: </b>{suggested.join(", ")}</div>
    </>
    );
}


// ====================================================================
// ChatSummaryCard
// ====================================================================
export default function ChatSummaryCard({ chatSession }: { chatSession: ChatSession }) {
    const navigate = useNavigate();
    const toChatDetails = () => {navigate('/chatDetails');} // Idk this is prob supposed to have an ID

    // Setup
    const duration = Math.ceil(chatSession.duration / 60)
    const date  = new Date(chatSession.date);
    const style = new Intl.DateTimeFormat("en-US", {year: 'numeric', month: 'short', day: '2-digit'})

    // Style
    const chatCardStyle = "border-1 p-[2rem] border-gray-300 rounded w-full hover:shadow-xl";
    const durationStyle = "flex md:flex-row float-right ml-auto";

    // Return UI component
    return (
    <div className="flex" key={chatSession.id}>
        <button className={chatCardStyle}  onClick={() => {toChatDetails()}}>
            <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-1 items-start text-left">
                    <h4>{style.format(date)}</h4>
                    <div><b>Topics covered: </b>{chatSession.topics}</div>
                    {overallCondition()}
                </div>
                <div className={durationStyle}> <p><b>{chatSession.duration}</b> minutes</p> </div>
            </div>
        </button>
    </div>
    );
}

