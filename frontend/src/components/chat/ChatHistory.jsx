import React, { useRef } from "react";

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
        const messageStyle = {You:     { marginFar: "l", marginClose: "r", bubbleColor: "purple" },
                              default: { marginFar: "r", marginClose: "l", bubbleColor: "green"  },};
        const { marginFar, marginClose, bubbleColor } = messageStyle[sender] || messageStyle.default;

        // UI elment for a text bubble & timestamp
        return (
            <div key={key} className={`flex flex-col m${marginFar}-auto m${marginClose}-[1em]`}>
                <p className={`bg-${bubbleColor}-200 p-[1em] w-fit rounded-sm`}> <b>{sender}:</b> {message} </p>
                <p className={`m${marginFar}-auto text-gray-400 text-xs`}>{time}</p>
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
