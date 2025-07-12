import { useChatSessions } from "@/hooks/queries/useChatSessions";
import   ChatOverview      from "./components/ChatOverview";

// ToDo: ...
export default function ProgressSummary() {
    const { data, isLoading } = useChatSessions();

    if (isLoading) { return <p>Loading chat history...</p>; }
    return (
        <div className="w-1/2"> <ChatOverview chatSession={ data[0] } /> </div>
    );
}
