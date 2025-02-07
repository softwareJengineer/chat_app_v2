import React from "react";
import ScoreChart from "./ScoreChart";

function BiomarkerDetails({name, score, description, yourDescription}) {

    function getScore(score) {
        if (score <= 2.0) {
            return "Excellent";
        } else if (score <= 4.0) {
            return "Good";
        } else if (score <= 6.0) {
            return "Fair";
        } else if (score <= 8.0) {
            return "Poor";
        } else if (score > 8.0) {
            return "Very Poor";
        }
    }

    return (
        <div className="w-[80vw] bg-blue-100 p-4 rounded-md">
            <h2 className="text-2xl mb-4">Your {name} Score</h2>
            <ScoreChart score={score}></ScoreChart>
            <p className="text-xl mt-4 font-bold mx-auto justify-center items-center flex">{getScore(score)}</p>
            <p>{description}</p>
            <p>{yourDescription}</p>
        </div>
    );
}

export default BiomarkerDetails;