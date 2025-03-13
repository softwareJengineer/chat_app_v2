import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend } from 'recharts';

const ScoreRadarChart = ({biomarkerData, prevBiomarkerData}) => {
    var data = [];

    for (var i = 0; i < biomarkerData.length; i++) {
        var name = biomarkerData[i].name;
        var scores = biomarkerData[i].data;
        var score = scores.reduce((prev, current) => prev + current) / scores.length;
        if (prevBiomarkerData) {
            var prevScores = prevBiomarkerData[i].data;
            var prevScore = prevScores.reduce((prev, current) => prev + current) / prevScores.length;
            data.push({name: name, x: score, y: prevScore});
        } else {
            data.push({name: name, x: score});
        }
    }
 
    return (
        <RadarChart height={500} width={600}
            outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <Radar dataKey="x" name="Current Scores" stroke="magenta"
                fill="magenta" fillOpacity={0.45} />
            {prevBiomarkerData ? 
                <Radar dataKey="y" name="Previous Scores" stroke="gray" fill="gray" fillOpacity={0.25} /> 
                : null
            }
            <Legend/>
        </RadarChart>
    );
}

export default ScoreRadarChart;