import React from "react";
import ScoreChart from "./ScoreChart";

function BiomarkerDetails({name, score, description, yourDescription}) {

    function getScore(score) {
        if (score <= .20) {
            return "Excellent";
        } else if (score <= .40) {
            return "Good";
        } else if (score <= .60) {
            return "Fair";
        } else if (score <= .80) {
            return "High";
        } else if (score > .80) {
            return "Very High";
        } else {
            return "N/A"
        }
    }

    return (
        <div className="w-full bg-blue-100 p-4 rounded-md">
            <h2 className="text-2xl mb-4">Your {name} Score</h2>
            <ScoreChart score={score}></ScoreChart>
            <p className="text-xl mt-4 font-bold mx-auto justify-center items-center flex">{getScore(score)}</p>
            <p>{description}</p>
            <p>Your {name} score falls into the range of <b>{getScore(score)}</b>, meaning {yourDescription}</p>
        </div>
    );
}

export default BiomarkerDetails;