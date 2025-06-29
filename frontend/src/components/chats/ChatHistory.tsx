import { useChatSessions } from "@/hooks/queries/useChatSessions";
import   ChatSummaryCard   from "@/components/chats/ChatSummaryCard";

// ====================================================================
// Chat History Panel (shown on Dashboard)
// ====================================================================
// View for multiple cards

/* 

ToDo: 
* Styling 
* "no chats" placeholder
    - Maybe if no chats, create a placeholder card in the same style/shape that says something
        and links to the chat page ?
* Sort button to the right of the "Chat History" h2 component

*/

export default function ChatHistory() {
    const { data, isLoading } = useChatSessions();

    if (isLoading) { return <p>Loading chat history...</p>; }
    return (
        <div className="m-[2rem]"> 
            <h2>Chat History</h2>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
                {data.map((chat) => ( <ChatSummaryCard key={chat.id} chatSession={chat} /> ))}
            </div>
        </div>
    );
}
