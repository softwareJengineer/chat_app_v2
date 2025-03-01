import React, { useState, Component } from "react";

const ChatHistory = ({messages}) => {

    function renderMessage(sender, message, time) {
        if (sender === 'You') {
            return (
                <div className="flex flex-col float-right ml-auto mr-[1em]">
                    <p className="p-[1em] bg-purple-200 w-fit rounded-sm">
                        <b>{sender}:</b> {message}
                    </p>
                    <p className="ml-auto text-gray-400 text-xs">{time}</p>
                </div>
            )
        } else {
            return (
                <div className="flex flex-col  ml-[1em]">
                    <p className="p-[1em] bg-green-200 w-fit rounded-sm">
                        <b>{sender}:</b> {message}
                    </p>
                    <p className="text-gray-400 text-xs">{time}</p>
                </div>
            )
        }
    }

    return (
        <>
            <h2 className="flex justify-center">Chat History</h2>
            <div className="overflow-y-auto flex flex-col">
                    {messages.map(({sender, message, time}, i) => (
                        renderMessage(sender, message, time)
                    ))}
            </div>
        </>
    )
}

export default ChatHistory;