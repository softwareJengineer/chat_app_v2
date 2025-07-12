import { BiomarkerType } from "@/api";
import { h3            } from "@/utils/styling/sharedStyles";
import ScoreRadarChart   from "./ScoreRadarChart";

export default function RadarTrack ({ current, previous } : {
    current  : Record<BiomarkerType, number>,
    previous : Record<BiomarkerType, number>,
}) {
    return (
        <div className="h-100 border-1 rounded-lg border-gray-200 p-[1rem] ">
            <p className={h3}> Radar Track </p>
            <div className="h-[45vh] w-full">
                <ScoreRadarChart current={ current } previous={ previous }/>  
            </div>
        </div>
    );
}
