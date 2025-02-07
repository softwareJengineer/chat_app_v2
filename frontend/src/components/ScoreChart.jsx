import React from "react";

function ScoreChart({score}) {

    function getColor(score) {
        if (score <= 2.0) {
            return "bg-green-600";
        } else if (score <= 4.0) {
            return "bg-lime-500";
        } else if (score <= 6.0) {
            return "bg-yellow-500";
        } else if (score <= 8.0) {
            return "bg-orange-500";
        } else if (score > 8.0) {
            return "bg-red-500";
        }
    }

    return (
        <>
            <div className={getColor(score) +" text-2xl w-[25vh] h-[25vh] flex rounded-full justify-center items-center mx-auto"}>
                {score}
            </div>
        </>
    )
}

export default ScoreChart;