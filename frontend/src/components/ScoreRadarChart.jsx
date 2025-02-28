import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const ScoreRadarChart = ({biomarkerData}) => {
    var data = [];

    for (var i = 0; i < biomarkerData.length; i++) {
        var name = biomarkerData[i].name;
        var scores = biomarkerData[i].data;
        var score = scores.reduce((prev, current) => prev + current) / scores.length;
        data.push({name: name, x: score})
    }
 
    return (
        <RadarChart height={500} width={600} 
            outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <Radar dataKey="x" stroke="magenta"
                fill="magenta" fillOpacity={0.35} />
        </RadarChart>
    );
}

export default ScoreRadarChart;