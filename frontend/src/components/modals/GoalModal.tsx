import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

// --------------------------------------------------------------------
// Goal Modal
// --------------------------------------------------------------------
export default function GoalModal({show, onHide}: {show: boolean; onHide: () => void;}) {
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
        <Modal.Header closeButton><Modal.Title> Set Goal </Modal.Title></Modal.Header>

        <Form onSubmit={handleSubmit}>
            <Modal.Body>
                 {/* Set Goal target number */}
                <Form.Group controlId="formTarget">
                    <Form.Label>Target chats per week</Form.Label>
                    <Form.Control type="number" value={target} onChange={(e) => setTarget(+e.target.value)}/>
                </Form.Group>

                {/* Select the goal start day */}
                <Form.Group controlId="formStartDay" className="mt-3">
                    <Form.Label>Start Day</Form.Label>
                    <Form.Select value={startDay} onChange={(e) => setStartDay(+e.target.value)} >
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d, i) => (<option key={i} value={i}> {d} </option>)
                    )}
                    </Form.Select>
                </Form.Group>
            </Modal.Body>

            {/* Cancel or Submit Buttons */}
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}> Cancel </Button>
                <Button type="submit">Save</Button>
            </Modal.Footer>

        </Form>
    </Modal>
    );
}
