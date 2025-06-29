import { Button, Modal } from "react-bootstrap";
import { h3 } from "@/utils/styling/sharedStyles";
import GoalForm from "@/components/forms/GoalForm";


// Goal Modal
export default function GoalModal({show, onHide}: {show: boolean; onHide: () => void;}) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("GoalModal button pressed");
        onHide();
    };

    // Return UI component
    return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
        <Modal.Header closeButton><span className={h3}> Patient Goal </span></Modal.Header>

        <div className="m-[1rem]">

            {/* Goal Form */}
            <GoalForm onSave={() => {}} onCancel={() => {}} /> 

        </div>

        {/* Cancel or Submit Buttons */}
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleSubmit}> Cancel </Button>
            <Button type="submit"               onClick={handleSubmit}> Save  </Button>
        </Modal.Footer>

    </Modal>
    );
}
