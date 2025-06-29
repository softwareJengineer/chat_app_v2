import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

import ScoreTrackGraph from "@/components/ScoreTrackGraph";
// ToDo: Biomarker graph

// ====================================================================
// Performance Track Panel (shown on Dashboard)
// ====================================================================
export default function PerformanceTrack() {
    const { profile         } = useAuth();
    const [active, setActive] = useState<"Overall" | "Biomarkers">("Overall");

    // Style
    const outerStyle = "m-[2rem] rounded-lg border-1 border-gray-300 p-[1rem] grid md:grid-cols-2 grid-cols-1 gap-4 md:min-h-[40vh]";

    // Return the UI component
    return (
    <div className={outerStyle}>
        {/* Text Section */}
        <div>
            <span className="flex gap-4">
            <h3> <b>Performance Track:</b> </h3>
            <button onClick={() => setActive("Overall")}    className={linkCls(active === "Overall"   )}>Overall   </button>
            <button onClick={() => setActive("Biomarkers")} className={linkCls(active === "Biomarkers")}>Biomarkers</button>
            </span>

            <p className="mt-4">
            This shows {profile?.plwd.first_name ?? "..."}'s performance over the past few weeks.
            </p>
            <p>Here will be a summary of the days with big drops in performance.</p>
            <p>Good days: A list of days with higher biomarker scores.</p>
            <p>Bad days: A list of days with lower biomarker scores.</p>
        </div>

        {/* Chart Section */}
        <div className="h-[40vh]">
            {active === "Overall"    && <ScoreTrackGraph/>}
            {active === "Biomarkers" && <ScoreTrackGraph />}
        </div>
    </div>
    );
}

// Helper for link styling
function linkCls(active: boolean) {
    return active
        ? "text-violet-600 underline hover:text-purple-900"
        : "text-gray-400 hover:text-gray-600 hover:underline";
}
