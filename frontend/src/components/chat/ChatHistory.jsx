import React, { useRef, useEffect } from "react";

const ChatHistory = ({messages}) => {
    // --------------------------------------------------------------------
    // Automatically scroll to bottom when messages change
    // --------------------------------------------------------------------
    const scrollContainerRef = useRef(null);
    const bottomRef = useRef(null);

    // Only auto scroll to the bottom if the user is already at/close to the bottom already
    useEffect(() => {
        const container = scrollContainerRef.current; if (!container) return;

        // Check if they are close enough
        const threshold      = 100;  // (pixels from bottom)
        const scrollPosition = container.scrollTop + container.clientHeight;
        const isAtBottom     = container.scrollHeight - scrollPosition < threshold;
        if (isAtBottom) {bottomRef.current?.scrollIntoView({ behavior: 'smooth' });}

    }, [messages]);

    // --------------------------------------------------------------------
    // Single Message UI Component (added "key" argument for react, maybe should be IDs though?)
    // --------------------------------------------------------------------
    function renderMessage(sender, message, time, key) {
        // Style differentiation between the user and the system
        const messageStyle = {You:     { marginFar: "ml-auto", marginClose: "mr-[1em]", bubbleColor: "bg-purple-200" },
                              default: { marginFar: "mr-auto", marginClose: "ml-[1em]", bubbleColor: "bg-green-200"  },};

        const { marginFar, marginClose, bubbleColor } = messageStyle[sender] || messageStyle.default;

        // UI elment for a text bubble & timestamp
        return (
            <div key={key} className={`flex flex-col ${marginFar} ${marginClose}`}>
                <p className={`${bubbleColor} p-[1em] w-fit rounded-sm`}> <b>{sender}:</b> {message} </p>
                <p className={`${marginFar} text-gray-400 text-xs`}>{time}</p>
            </div>
        );
    }

    // --------------------------------------------------------------------
    // ChatHistory UI Component
    // --------------------------------------------------------------------
    return (
        <>
            <h2 className="flex justify-center">Chat History</h2>
            <div ref={scrollContainerRef} className="overflow-y-auto flex flex-col">
                    {messages.map(({sender, message, time}, i) => (renderMessage(sender, message, time, i)))}
                    <div ref={bottomRef} />
            </div>
        </>
    )
}

export default ChatHistory;
