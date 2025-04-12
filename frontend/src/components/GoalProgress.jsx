import React from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';

function GoalProgress({props}) {
    console.log(props)
    const percent = Math.round((props.current / props.goal) * 100);

    return (
        <>
            <ProgressBar now={percent} />
        </>
    )
}

export default GoalProgress;