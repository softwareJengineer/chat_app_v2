import React, { useContext, useEffect, useState } from "react"
import Header from "../components/Header";
import { UserContext } from "../App";
import { Button, Form } from "react-bootstrap";


function Settings() {
    const {user, setUser, settings, setSettings} = useContext(UserContext);
    const [formSettings, setFormSettings] = useState({
        patientViewOverall: true,
        patientCanSchedule: true
    })

    const handleChange = (e) => {
        setFormSettings({
            ...formSettings,
            [e.target.name]: e.target.checked
        });
    };

    // useEffect(() => {
    //     async function get_settings() {
    //         try {
    //             const response = await fetch('http://localhost:8000/api/settings/', {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 credentials: 'include'
    //             });

    //             const data = await response.json();
    //             if (data.success) {
    //                 setSettings({
    //                     patientViewOverall: data.patientViewOverall, 
    //                     patientCanSchedule: data.patientCanSchedule
    //                 })
    //             } else {
    //                 console.error(data.error);
    //             }
    //         } catch (error) {
    //             console.error('Could not get the user settings:', error);
    //         }
    //     }

    //     get_settings();
    // }, [])

    const saveChanges = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/settings/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                // credentials: 'include',
                body: JSON.stringify({...settings, user: user})
            });

            const data = await response.json();
            if (data.success) {
                alert("Settings successfully set.");
                setSettings(formSettings);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error setting user settings:', error);
        }
    }

    return (
        <>
        <Header title="Your Settings" page="settings" />
        <div class="m-[2rem] flex flex-col gap-2">
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