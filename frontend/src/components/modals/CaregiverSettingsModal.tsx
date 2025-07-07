import { useRef           } from "react";
import { Button, Modal    } from "react-bootstrap";
import { UserSettingsForm } from "@/components/forms/UserSettingsForm";
import {         GoalForm } from "@/components/forms/GoalForm";

// ====================================================================
// Caregiver Settings Modal
// ====================================================================
// View/Modify:
//  * UserSettings
//  * Patient Goal
//  * [ToDo] ChatHistory settings
//  * [ToDo] SingleChatAnalysis settings 
export default function CaregiverSettingsModal({show, onHide}: {show: boolean; onHide: () => void;}) {
    // Form handle for each individual form included
    const userSettingsFormHandle = useRef<{ submit: () => void }>(null);
    const         goalFormHandle = useRef<{ submit: () => void }>(null);
 
    // Asynchronously submit each form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await Promise.all([
            userSettingsFormHandle.current?.submit(),
            goalFormHandle        .current?.submit(),
        ]);
        onHide();  // (only close after the submissions finish)
    };

    // --------------------------------------------------------------------
    // Return UI component
    // --------------------------------------------------------------------
    return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title> Settings </Modal.Title></Modal.Header>

        <div className="m-[1rem]">
            <UserSettingsForm ref={ userSettingsFormHandle } /> <hr/>
            <GoalForm         ref={         goalFormHandle } /> 
        </div>

        <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide      }> Cancel </Button>
            <Button type="submit"               onClick={handleSubmit}> Save   </Button>
        </Modal.Footer>

    </Modal>
    );
}
