import React from "react";

function ScoreChart({score}) {

    function getColor(score) {
        if (score <= .20) {
            return "bg-red-600";
        } else if (score <= .40) {
            return "bg-orange-500";
        } else if (score <= .60) {
            return "bg-yellow-500";
        } else if (score <= .80) {
            return "bg-lime-500";
        } else if (score > .80) {
            return "bg-green-500";
        } else {
            return "bg-gray-400";
        }
    }

    return (
        <>
            <div className={getColor(score) +" text-4xl w-[25vh] h-[25vh] flex rounded-full justify-center items-center mx-auto"}>
                {score}/10
            </div>
        </>
    )
}

export default ScoreChart;