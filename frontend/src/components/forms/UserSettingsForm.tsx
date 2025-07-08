import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { h4, switchStyle, switchLabel } from "@/utils/styling/sharedStyles";
import { toastMessage                 } from "@/utils/functions/toast_helper";
import { useAuth                      } from "@/context/AuthProvider";
import { updateUserSettings           } from "@/api";

type Methods = { submit: () => void };

// ====================================================================
// UserSettings Form
// ====================================================================
export const UserSettingsForm = forwardRef<Methods>((props, ref) => {
    // Lift form submission control up to the parent element
    const formRef = useRef<HTMLFormElement>(null);
    useImperativeHandle(ref, () => ({ submit() { formRef.current?.requestSubmit(); } }));

    // Get the current values from the profile & set them as state values for the form
    const { profile } = useAuth();
    const [patientViewOverall, setPatientViewOverall] = useState<boolean>(profile.settings.patientViewOverall);
    const [patientCanSchedule, setPatientCanSchedule] = useState<boolean>(profile.settings.patientCanSchedule);

    // Form submission logic 
    // ToDo: actually change the settings -- maybe do the async/await here + try and except
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toastMessage("User settings updated", true); 
    };


    // --------------------------------------------------------------------
    // Return UI component
    // --------------------------------------------------------------------
    return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col">
        <div className={h4}> Patient Authority </div>

        <div className={switchStyle}>
            <label className={switchLabel}> PLwD can view "Personal Page" </label>
            <input className="form-check-input" type="checkbox" role="switch" checked={patientViewOverall ?? false} onChange={(e) => setPatientViewOverall(e.target.checked)}/>
        </div>

        <div className={switchStyle}>
            <label className={switchLabel}> PLwD can schedule new chats or activities </label>
            <input className="form-check-input" type="checkbox" role="switch" checked={patientCanSchedule ?? false} onChange={(e) => setPatientCanSchedule(e.target.checked)}/>
        </div>
        
    </form>
    );
});
