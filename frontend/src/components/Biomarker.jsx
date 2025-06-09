import React from "react";
import { Button } from "react-bootstrap";

function Biomarker({name}) {
    return (
        <div>
            <Button
                className="p-4 shadow-md w-[20vw]"
                variant="outline-primary"
            >
                {name}
            </Button>
        </div>
    );
}

export default Biomarker;