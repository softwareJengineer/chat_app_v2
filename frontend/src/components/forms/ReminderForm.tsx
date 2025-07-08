import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Reminder     } from "@/api";
import { toastMessage } from "@/utils/functions/toast_helper";
import { DAYS         } from "@/utils/misc/constants";


type Methods = { submit: () => void };
interface ReminderFormProps {
    initial: Reminder;                  // pre-filled data
    onSave?: (data: Reminder) => void; // callback after submit
}

// ====================================================================
// Reminder Form
// ====================================================================
export const ReminderForm = forwardRef<Methods, ReminderFormProps>(({ initial, onSave }, ref) => {
    // Lift form submission control up to the parent element
    const formRef = useRef<HTMLFormElement>(null);
    useImperativeHandle(ref, () => ({ submit() { formRef.current?.requestSubmit(); } }));

    // Get the current values from the profile & set them as state values for the form
    const [reminder, setReminder] = useState<Reminder>(initial);

    // Form submission logic 
    // ToDo: actually change the settings -- maybe do the async/await here + try and except
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toastMessage("Reminder form submitted", true); 
    };

    // --------------------------------------------------------------------
    // Return UI component 
    // --------------------------------------------------------------------
    const formText = "fs-5 fw-semibold";
    return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col">

        {/* Title */}
        <div className="mb-3 w-100">
            <label htmlFor="title" className={formText}>Title</label>
            <input className="form-control" id="title" type="text" value={reminder.title} onChange={e => setReminder(r => ({ ...r, title: e.target.value }))} />
        </div>

        {/* Time Range */}
        <div className="d-flex gap-3 mb-3">
            <div> <label htmlFor="startTime" className={formText}>Start time</label>
                  <input className="form-control" id="startTime" type="time" value={reminder.startTime} onChange={e => setReminder(r => ({ ...r, startTime: e.target.value }))} /> </div>

            <div> <label htmlFor="endTime" className={formText}>End time</label>
                  <input className="form-control" id="endTime" type="time" value={reminder.endTime} onChange={e => setReminder(r => ({ ...r, endTime: e.target.value }))} /> </div>
        </div>

        {/* Repeat Days */}
        <div className="mb-3">
            <span className={formText}>Repeat on</span>
            <div className="d-flex flex-wrap gap-2 mt-1 justify-start">
                {DAYS.map((dayName, dayIdx) => (
                    RepeatDaySelection({ dayName, dayIdx, reminder, setReminder })
                ))}
            </div>
        </div>

    </form>
    );
});


// --------------------------------------------------------------------
// Repeat Days  
// --------------------------------------------------------------------
function RepeatDaySelection({ dayName, dayIdx, reminder, setReminder } : {
    dayName     : string, 
    dayIdx      : number, 
    reminder    : Reminder, 
    setReminder : React.Dispatch<React.SetStateAction<Reminder>>
}) {
    // Style
    const labelStyle = "btn btn-outline-primary fw-semibold w-[8rem]";

    return (
    <div key={dayIdx} className="form-check form-check-inline">
        <label className={labelStyle} htmlFor={`dow-${dayIdx}`}> {dayName} </label>

        <input className="btn-check" type="checkbox" id={`dow-${dayIdx}`} checked={reminder.daysOfWeek.includes(dayIdx)} 
            onChange={() => setReminder(r => ({ ...r,
                daysOfWeek: r.daysOfWeek.includes(dayIdx)
                    ? r.daysOfWeek.filter(d => d !== dayIdx) // remove
                    : [...r.daysOfWeek, dayIdx]              // add
            }))}
        />
    </div>
    );
}
