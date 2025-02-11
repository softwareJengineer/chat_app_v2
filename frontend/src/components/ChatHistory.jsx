import React, { useState, Component } from "react";
import ReactDOM from "react-dom/client";

const ChatHistory = ({messages}) => {

    function renderMessage(sender, message) {
        if (sender === 'You') {
            return (
                <p className="p-[1em] bg-purple-200 w-fit rounded-sm m-[1em] ml-auto">
                    <b>{sender}:</b> {message}
                </p>
            )
        } else {
            return (
                <p className="p-[1em] bg-green-200 w-fit rounded-sm m-[1em]">
                    <b>{sender}:</b> {message}
                </p>
            )
        }
    }

    return (
        <>
            <div className="overflow-y-auto">
                    {messages.map(({sender, message}, i) => (
                        renderMessage(sender, message)
                    ))}
            </div>
        </>
    )
}

export default ChatHistory;