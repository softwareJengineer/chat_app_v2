import React, { useState, Component } from "react";

const ChatHistory = ({messages}) => {
    // --------------------------------------------------------------------
    // Single Message
    // --------------------------------------------------------------------
    // Added "key" argument for react, maybe should be IDs though?
    function renderMessage(sender, message, time, key) {
        // Message from the user
        if (sender === 'You') {
            return (
                <div key={key} className="flex flex-col float-right ml-auto mr-[1em]">
                    <p className="p-[1em] bg-purple-200 w-fit rounded-sm"> <b>{sender}:</b> {message} </p>
                    <p className="ml-auto text-gray-400 text-xs">{time}</p>
                </div>
            )
        // Message from the system    
        } else {
            return (
                <div key={key} className="flex flex-col  ml-[1em]">
                    <p className="p-[1em] bg-green-200 w-fit rounded-sm"> <b>{sender}:</b> {message} </p>
                    <p className="text-gray-400 text-xs">{time}</p>
                </div>
            )
        }
    }

    // --------------------------------------------------------------------
    // UI Component
    // --------------------------------------------------------------------
    return (
        <>
            <h2 className="flex justify-center">Chat History</h2>
            <div className="overflow-y-auto flex flex-col">
                    {messages.map(({sender, message, time}, i) => (renderMessage(sender, message, time, i)))}
            </div>
        </>
    )
}

export default ChatHistory;