import React from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';

function GoalProgress({current}) {
    
    const getPercent = (chats) => {
        const goal = (Math.floor(chats / 5) + 1) * 5;
        return Math.round((chats / goal) * 100);
    }

    return (
        <div className="my-4">
            <ProgressBar now={getPercent(current)} />
        </div>
    )
}

export default GoalProgress;