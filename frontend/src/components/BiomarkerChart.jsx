import React, {useState} from "react";
import ReactApexChart from "react-apexcharts";

const BiomarkerChart = ({biomarkerData}) => {

    const options = {
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
                curve: 'straight'
            },
            xaxis: {

            },
            yaxis: {
                min: 0,
                max: 1.0,
                tickAmount: 20,
                stepSize: 0.05,
                forceNiceScale: true,
                decimalsInFloat: 3
            }
        }
    }

    return (
        <div className="flex flex-col space-y-4 ml-4 mr-10 mb-4">
            <h1 className="text-2xl font-bold">Biomarker Chart</h1>
            <ReactApexChart options={options} series={biomarkerData ? biomarkerData : []} type="line" height={350}/>
        </div>
    );

}

export default BiomarkerChart;