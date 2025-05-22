import React from "react";
import { FcVoicePresentation } from "react-icons/fc";
import { Icon } from '@iconify/react';

const ChatLog = ({messages, firstName, lastName}) => {
    function renderMessage(sender, message, time) {
        if (sender === 'You') {
            return (
                <div className="flex flex-row gap-2">
                    <div className="self-center align-middle">
                        <FcVoicePresentation size={50}/>
                    </div>  
                    <div>
                        <span className="flex flex-row gap-2 h-lh">
                            <b>{firstName} {lastName}</b>
                            <p className="text-gray-300">{time}</p>
                        </span>
                        <p>{message}</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="flex flex-row gap-2 align-middle">
                    <div className="self-center">
                        <Icon icon="fluent-color:bot-16" width="50" height="50"></Icon>
                    </div>  
                    <div>
                        <span className="flex flex-row gap-2 h-lh">
                            <b>Robot</b>
                            <p className="text-gray-300">{time}</p>
                        </span>
                        <p>{message}</p>
                    </div>
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