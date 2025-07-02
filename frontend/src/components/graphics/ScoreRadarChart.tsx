import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer } from "recharts";
import { BiomarkerType } from "@/api";
import { biomarkerKeysLower } from "@/utils/styling/options";


// --------------------------------------------------------------------
// Radar Chart of current and previous chat biomarker scores
// --------------------------------------------------------------------
export default function ScoreRadarChart ({current, previous} : {
    current  : Record<BiomarkerType, number>,
    previous : Record<BiomarkerType, number>,
}) {
    // Data and labels
    const data = biomarkerKeysLower.map((k) => ({
        name    : k,
        current : current[k] ?? 0,
        prev    : previous ? previous[k] ?? 0 : undefined,
    }));
 
    const currColor = "magenta";
    const prevColor = "gray";

    // Return UI component
    return (
    <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />

        <Radar name="Current" dataKey="current" stroke={currColor} fill={currColor} fillOpacity={0.45}/>

        {/* Previous Sessions */}
        {previous && (
          <Radar name="Previous" dataKey="prev"  stroke={prevColor} fill={prevColor} fillOpacity={0.25}/>
        )}

            <Legend/>
        </RadarChart>
    </ResponsiveContainer>
    );
}
