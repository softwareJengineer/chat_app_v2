import { useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import { Reminder } from "@/api";
import { ReminderForm } from "@/components/forms/ReminderForm";

import { FaCalendar } from "react-icons/fa6";

// ====================================================================
// Reminder Modal
// ====================================================================
// ToDo: Delete function can be called here using the Reminder ID
export default function ReminderModal ({rem, show, existing, onHide}: {rem: Reminder; show: boolean; existing: boolean; onHide: () => void;}) {
    const reminderFormHandle = useRef<{ submit: () => void }>(null);
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        reminderFormHandle.current?.submit(); 
        onHide(); 
    };

    // Return UI component
    return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
        <Modal.Header closeButton>
            <FaCalendar size={25} className="mr-[1rem]" />
            <Modal.Title> {existing ? null : "New"} Reminder </Modal.Title>
        </Modal.Header>

        <div className="m-[1rem]"> 
            <ReminderForm ref={reminderFormHandle} initial={rem} />
        </div>

        <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide      }> Cancel </Button>
            <Button type="submit"               onClick={handleSubmit}> Save   </Button>
            { existing ? <Button variant="outline-danger"  onClick={handleSubmit}> Delete </Button> : null }
        </Modal.Footer>

    </Modal>
    );
}
