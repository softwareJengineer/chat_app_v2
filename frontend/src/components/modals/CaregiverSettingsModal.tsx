import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

import GoalForm from "@/components/forms/GoalForm";


// --------------------------------------------------------------------
// Caregiver Settings Modal
// --------------------------------------------------------------------
// View/Modify:
//  * UserSettings
//  * Patient Goal
//  * [ToDo] ChatHistory settings
//  * [ToDo] SingleChatAnalysis settings 
export default function CaregiverSettingsModal({show, onHide}: {show: boolean; onHide: () => void;}) {

    const [target,   setTarget  ] = useState(5);
    const [startDay, setStartDay] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // call mutation here
        onHide();
    };

    // Return UI component
    return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title> Settings </Modal.Title></Modal.Header>

        {/* 1) Patient Settings */}
        {/* -------------------------------------------------------------------- */}



        {/* 2) Patient Goal */}
        {/* -------------------------------------------------------------------- */}
  


        {/* Cancel or Submit Buttons */}
        {/* -------------------------------------------------------------------- */}
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide}> Cancel </Button>
            <Button type="submit"                               > Save   </Button>
        </Modal.Footer>

    </Modal>
    );
}










