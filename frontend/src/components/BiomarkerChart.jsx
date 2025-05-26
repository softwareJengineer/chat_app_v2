import React, {useEffect, useState} from "react";
import ReactApexChart from "react-apexcharts";

const BiomarkerChart = ({biomarkerData}) => {

    const summarizeData = (biomarkerData) => {
        var newData = [];
        for (var key in biomarkerData) {
            var series = biomarkerData[key];
            if (key >= 2) {
                series.hidden = "true";
            }
            newData.push(series);
        }
        return newData;
    }


    const options = {
        chart: {
            height: 350,
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
        <ReactApexChart options={options} series={summarizeData(biomarkerData)} type="line" height={"100%"}/>
    );

}

export default BiomarkerChart;