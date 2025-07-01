import { useRef, useEffect } from "react";
import { CAREGIVER_HEX, PATIENT_HEX} from "@/utils/styling/colors";

//import { ChatMessage } from "@/api";
import { LocalChatMessage } from "@/hooks/live-chat";

// ====================================================================
// Render a single chat message from the user or the robot
// ====================================================================
// ToDo: Probably need to format the time
// function getMessageTime() {const msgDate = new Date(); return msgDate.getUTCHours() + ':' + msgDate.getUTCMinutes() + ':' + msgDate.getUTCSeconds();}

// ToDo: Make it easier to adjust the size of the text -- put that as a part of the user settings?
function MessageBubble({ msg }: { msg: LocalChatMessage }) {
    // Style differentiation between the user and the system
    const messageStyle = {user:    { sender: "You",      marginFar: "ml-auto", marginClose: "mr-[1em]", bubbleColor: "bg-purple-200" },
                          default: { sender: "Cognibot", marginFar: "mr-auto", marginClose: "ml-[1em]", bubbleColor: "bg-green-200"  },};
    const { sender, marginFar, marginClose, bubbleColor } = messageStyle[msg.role] || messageStyle.default;

    // Styles
    const messageBubbleStyle = `flex flex-col ${marginFar} ${marginClose}`;
    const messageTextStyle   = `${bubbleColor} p-[1em] w-fit rounded-sm`;
    const messageTimeStyle   = `${marginFar} text-gray-400 text-xs`;

    // UI elment for a text bubble & timestamp
    return (
        <div key={msg.id} className={messageBubbleStyle}>
            <p className={messageTextStyle}> <b>{sender}:</b> {msg.content} </p>
            <p className={messageTimeStyle}>                  {msg.ts     } </p>
        </div>
    );
}

// ====================================================================
// ChatMessages (scroll view)
// ====================================================================
export default function ChatMessages({ messages }: { messages: LocalChatMessage[] }) {
    // --------------------------------------------------------------------
    // Automatically scroll to bottom when messages change
    // --------------------------------------------------------------------
    const scrollContainerRef = useRef(null);
    const bottomRef          = useRef(null);

    // Only auto scroll to the bottom if the user is already at/close to the bottom already
    useEffect(() => {
        const container = scrollContainerRef.current; if (!container) return;

        // Check if they are close enough
        const threshold      = 100;  // (pixels from bottom)
        const scrollPosition = container.scrollTop    + container.clientHeight;
        const isAtBottom     = container.scrollHeight - scrollPosition < threshold;
        if (isAtBottom) {bottomRef.current?.scrollIntoView({ behavior: "smooth" });}

    }, [messages]);


    // Return UI component
    return (
        <>
            <h2 className="flex justify-center">Chat History</h2>
            <div ref={scrollContainerRef} className="overflow-y-auto flex flex-col">
                    {messages.map((msg) => (<MessageBubble msg={msg}/>))}
                    <div ref={bottomRef} />
            </div>
        </>
    );
}
