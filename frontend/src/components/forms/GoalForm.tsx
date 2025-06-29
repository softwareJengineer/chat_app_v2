import { useEffect, useState } from "react";
import { useGoal, useUpdateGoal } from "@/hooks/queries/useGoal";
import { Goal } from "@/api";

import { h3 } from "@/utils/styling/sharedStyles";
import { dateFormatShort } from "@/utils/styling/numFormatting";

// Helpers
interface Props { onSave(data: Goal): void; onCancel(): void; }
const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type PeriodOptions = "Week" | "Month";

// =======================================================================
// Goal Update Form
// =======================================================================
// ToDo: add colors based on user being patient or caregiver
export default function GoalForm({ onSave, onCancel }: Props) {
    // --------------------------------------------------------------------
    // Load current goal & use it to set form data
    // --------------------------------------------------------------------
    const { data: goal, isLoading } = useGoal();
    const updateGoal = useUpdateGoal();

    // Local editable state
    const [autoRenew, setAutoRenew] = useState(true);
    const [target,    setTarget   ] = useState(5);
    const [period,    setPeriod   ] = useState<"Week" | "Month">("Week");
    const [startDay,  setStartDay ] = useState(0);

    // Once the query succeeds, fill out the form fields
    useEffect(() => {
        if (goal) {
            setTarget   (goal.target);
            setStartDay (goal.startDay);
        }
    }, [goal]);
    if (isLoading) { return <p> Loading... </p>; }

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        console.log("Submitted new Goal");
        e.preventDefault();
        const body: Partial<Goal> = { target, startDay }; // autoRenew, period,
        //updateGoal.mutate(body, { onSuccess: onSave });
        console.log("Submitted new Goal");
        console.log(body);
    };


    // --------------------------------------------------------------------
    // Handle Dates
    // --------------------------------------------------------------------
    // Get start day from the current date and the starting form data
    const today       = new Date();
    const todayIdx    = today.getDay();                            // Sun = 0, etc.
    const diff        = (7 + todayIdx - ((startDay + 1) % 7)) % 7; // day of the week
    
    // Set the window start and end dates
    const windowStart = new Date(today      ); windowStart.setDate(today      .getDate() - diff);
    const windowEnd   = new Date(windowStart); windowEnd  .setDate(windowStart.getDate() + 6   );
    const windowLabel = `${dateFormatShort.format(windowStart)} - ${dateFormatShort.format(windowEnd)} (7 Days)`;


    // --------------------------------------------------------------------
    // UI Component (three rows)
    // --------------------------------------------------------------------
    const formText = "font-medium fw-bold";

    const borderStyle = "border border-gray-100 py-1 px-2"; // rounded
    
    const typeStyle    = `w-40 text-gray-400 bg-gray-100 ${borderStyle}`;
    const goalNumber   = `w-15 ${borderStyle}`;
    const timeUnit     = `w-25 ${borderStyle}`;
    const startStyle   = `mt-1 ${borderStyle}`;
    const currentStyle = `mt-1 bg-gray-100 text-gray-400 ${borderStyle}`;
    

    return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        
        {/* 1) Auto Renew */}
        {/* -------------------------------------------------------------------- */}
        <label className="flex items-center justify-between">
            <span className={formText}> Auto-renew goal frequency </span>
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" checked={autoRenew ?? false} onChange={(e) => setAutoRenew(e.target.checked)}/>
            </div>
        </label>


        {/* 2) Frequency row */}
        {/* -------------------------------------------------------------------- */}
        <div className="flex flex-col"> 
            <span className={formText}>Frequency</span>
            <div className="flex items-center justify-between gap-2">

                {/* Type of activity we have the goal for (?) */}
                <select disabled className={typeStyle}> <option>Daily Chat</option> </select>

                {/* Goal number */}
                <input type="number" min={1} className={goalNumber} value={target} onChange={(e) => setTarget(+e.target.value)} />

                {/* Time unit */}
                <span className="w-20"> Times Per </span>
                <select className={timeUnit} value={period} onChange={(e) => setPeriod(e.target.value as PeriodOptions)}>
                    <option value="Week" > Week  </option>
                    <option value="Month"> Month </option>
                </select>

            </div>
        </div>

        {/* 3) Start day & window */}
        {/* -------------------------------------------------------------------- */}
        <div className="flex items-center gap-2">
            {/* Start day */}
            <div className="flex flex-col justify-around gap-0 w-50">
                <label className={formText}>Start Day</label>
                <select className={startStyle} value={startDay} onChange={(e) => setStartDay(+e.target.value)} >
                    {weekdayNames.map((day, i) => (<option key={i} value={i}> {day} {i === todayIdx && "(Today)"} </option>))}
                </select>
            </div>

            {/* Current window preview */}
            <div className="flex flex-col justify-around gap-0 w-50">
                <label className={formText}>Current Goal Window</label>
                <span className={currentStyle}> {windowLabel} </span>
            </div>
        </div>


    </form>
    );
}
