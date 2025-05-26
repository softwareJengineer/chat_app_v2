import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer } from 'recharts';
import getRadarScores from '../functions/getRadarScores';

const ScoreRadarChart = ({biomarkerData, prevBiomarkerData}) => {
    const data = getRadarScores(biomarkerData, prevBiomarkerData);
 
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart height="100%" width="100%"
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
        </ResponsiveContainer>
    );
}

export default ScoreRadarChart;