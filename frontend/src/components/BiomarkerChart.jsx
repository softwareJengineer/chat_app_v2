import React, {useState} from "react";
import ReactApexChart from "react-apexcharts";

const BiomarkerChart = ({biomarkerData1}) => {
    const biomarkerData = [
        {
            name: "Pragmatic",
            data: [1.5, 1, 2, 2.2, 0.8]
        },
        {
            name: "Grammar",
            data: [2, 1, 3, 2, 2]
        },
        {
            name: "Anomia",
            data: [7, 8, 6, 8, 6]
        },
        {
            name: "Turn Taking",
            data: [3, 2, 4, 2, 4]
        },
        {
            name: "Prosody",
            data: [1, 1, 1, 1, 1]
        },
        {
            name: "Pronounciation",
            data: [7, 6, 9, 5, 6]
        },
    ]
    const [state, setState] = React.useState ({
       options: {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            animations: {
                enabled: false
            },
            stroke: {
                width: [5,5,4],
                curve: 'smooth'
            },
            labels: [1, 2, 3, 4, 5],
            title: {
                text: "Biomarker Scores"
            },
            xaxis: {

            }
        }
       } 
    })

    return (
        <div className="flex flex-col space-y-4 ml-4 mr-4 mb-4">
            <h1 className="text-2xl font-bold">Biomarker Chart</h1>
            <ReactApexChart options={state.options} series={biomarkerData} type="line" height={350}/>
        </div>
    );

}

export default BiomarkerChart;