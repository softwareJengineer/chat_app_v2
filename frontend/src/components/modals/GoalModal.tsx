import { useRef        } from "react";
import { Button, Modal } from "react-bootstrap";
import { GoalForm      } from "@/components/forms/GoalForm";

// ====================================================================
// Goal Modal
// ====================================================================
export default function GoalModal({ show, onHide }: { show: boolean; onHide: () => void; }) {
    const goalFormHandle = useRef<{ submit: () => void }>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await Promise.all([ goalFormHandle .current?.submit() ]);
        onHide();
    };

    // --------------------------------------------------------------------
    // Return UI component  size="lg"
    // --------------------------------------------------------------------
    return (
    <Modal show={show} onHide={onHide} centered backdrop="static" >
        <Modal.Header closeButton><Modal.Title> Patient Goal </Modal.Title></Modal.Header>

        <div className="m-[1rem]">

            <GoalForm ref={goalFormHandle} /> 

        </div>

        {/* Cancel or Submit Buttons */}
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide      }> Cancel </Button>
            <Button type="submit"               onClick={handleSubmit}> Save  </Button>
        </Modal.Footer>

    </Modal>
    );
}
