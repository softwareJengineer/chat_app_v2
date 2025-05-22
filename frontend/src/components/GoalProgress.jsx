import React from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';

function GoalProgress({current, target}) {

    const percent = Math.round((current / target) * 100);

    return (
        <div className="my-4">
            <ProgressBar now={percent} />
        </div>
    )
}

export default GoalProgress;