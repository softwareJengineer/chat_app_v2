import React, { useContext, useState } from "react"
import Header from "../components/Header";
import { UserContext } from "../App";
import { Button, Form } from "react-bootstrap";


function Settings() {
    const {user, setUser} = useContext(UserContext);
    const [patientViewOverall, setPatientViewOverall] = useState(true);
    const [patientCanSchedule, setPatientCanSchedule] = useState(true);

    function saveChanges() {

    }

    return (
        <>
        <Header title="Your Settings" page="settings" />
        <div class="m-[2rem] flex flex-col gap-2">
            <h3>PLwD Controls</h3>
            <Form onSubmit={saveChanges}>  
                <Form.Switch
                    label="PLwD Can View Overall Analysis"
                    checked={patientViewOverall}
                    onChange={(e) => setPatientViewOverall(e.target.checked)}
                />
                <Form.Switch
                    label="PLwD Can Schedule New Items"
                    checked={patientCanSchedule}
                    onChange={(e) => setPatientCanSchedule(e.target.checked)}
                />
            </Form>
            <Button type="submit">Save Changes</Button>
        </div>
        </>
    );
}

export default Settings;