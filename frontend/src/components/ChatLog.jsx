import React, { useState, Component } from "react";

const ChatLog = ({messages, firstName, lastName}) => {
    function renderMessage(sender, message, time) {
        if (sender === 'You') {
            return (
                <div>
                    <span className="flex flex-row gap-4">
                        <b>{firstName} {lastName}</b>
                        <p className="text-gray-300">{time}</p>
                    </span>
                    <p>{message}</p>
                </div>
            )
        } else {
            return (
                <div>
                    <span className="flex flex-row gap-4">
                        <b>Robot</b> 
                        <p className="text-gray-300">{time}</p>
                    </span>
                    <p>{message}</p>
                </div>
            )
        }
    }

    return (
        <>
            <span className="flex flex-row gap-4">
                <h2>Transcript:</h2>
            </span>
            <div className="overflow-y-auto flex flex-col">
                    {messages.map(({sender, message, time}, i) => (
                        renderMessage(sender, message, time)
                    ))}
            </div>
        </>
    )
}

export default ChatLog;