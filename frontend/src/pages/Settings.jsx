import React, { useContext, useState } from "react"
import Header from "../components/Header";
import { UserContext } from "../App";

function Settings() {
    const {user, setUser} = useContext(UserContext);
    
    if (!user) {
        navigate("/login");
    }

    return (
        <>
        <Header />
        <h1 className="p-[2rem]">Your Settings</h1>
        </>
    );
}

export default Settings;