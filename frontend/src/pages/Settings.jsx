import React, { useContext, useEffect, useState } from "react"
import Header from "../components/Header";
import AuthContext from '../context/AuthContext';
import { Button, Form } from "react-bootstrap";
import { editSettings } from "../functions/apiRequests";


function Settings() {
    const {user, settings, setSettings} = useContext(AuthContext);
    const [formSettings, setFormSettings] = useState(settings);

    const handleChange = (e) => {
        setFormSettings({
            ...formSettings,
            [e.target.name]: e.target.checked
        });
    };

    const saveChanges = async (e) => {
        e.preventDefault();
        const response = await editSettings(user, formSettings);
        if (response) setSettings(formSettings);
    }

    return (
        <>
        <Header title="Your Settings" page="settings" />
        <div className="m-[2rem] flex flex-col gap-2">
            <h3>PLwD Controls</h3>
            <Form onSubmit={saveChanges}>  
                <Form.Switch
                    label="PLwD Can View Overall Analysis"
                    checked={formSettings.patientViewOverall}
                    name="patientViewOverall"
                    onChange={handleChange}
                />
                <Form.Switch
                    label="PLwD Can Schedule New Items"
                    checked={formSettings.patientCanSchedule}
                    name="patientCanSchedule"
                    onChange={handleChange}
                />
                <Button type="submit">Save Changes</Button>
            </Form>
        </div>
        </>
    );
}

export default Settings;