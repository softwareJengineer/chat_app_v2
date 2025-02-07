import React from "react";
import { useLocation } from "react-router-dom";
import BiomarkerChart from "../components/BiomarkerChart";

function NewEntry() {
    const location = useLocation();
    const biomarkerData = location.state;

    return (
        <>
            <div className="mt-[2em] ml-[2em]">
                <label className="text-xl">
                    Name: 
                    <input className="border-1 m-2 p-2" name="name" />
                </label>
                <br/>
                <label className="text-xl">
                    Date: 
                    <input className="border-1 m-2 p-2" name="date" />
                </label>
                <label className="text-xl">
                    Notes: 
                    <textarea className="border-1 m-2 rows-4 p-2" name="notes" />
                </label>
            </div>
            <BiomarkerChart biomarkerData={biomarkerData}></BiomarkerChart>
        </>
    )
}

export default NewEntry;