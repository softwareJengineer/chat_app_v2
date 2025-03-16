import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend } from 'recharts';
import getRadarScores from '../functions/getRadarScores';

const ScoreRadarChart = ({biomarkerData, prevBiomarkerData}) => {
    const data = getRadarScores(biomarkerData, prevBiomarkerData);
 
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