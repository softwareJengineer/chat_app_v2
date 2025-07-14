import { useChatSessions } from "@/hooks/queries/useChatSessions";
import   ChatOverview      from "./components/ChatOverview";
import   DetailedAnalysis  from "@/components/details/DetailedAnalysis";

// ToDo: ...
export function ProgressSummary() {
    const { data, isLoading } = useChatSessions();

    if (isLoading) { return <p>Loading chat history...</p>; }
    return (
        <div className="flex flex-col"> 
            <ChatOverview chatSession={ data[0] } /> 
            {/* <DetailedAnalysis session={ data[0] } /> */}
        </div>
    );
}
