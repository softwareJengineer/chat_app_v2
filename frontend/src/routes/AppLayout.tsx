// src/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { RUN_ENV } from "../utils/constants";

import Header from "@/components/Header";

export default function AppLayout() {
    const { user, profile } = useAuth();
    
    // Header & small info bar for development
    const pageHeader = (user            ) ? (<Header/>) : null;
    const DevBar     = (RUN_ENV == "DEV") ? (
        <div className="bg-yellow-100 px-4 py-1 text-xs flex gap-4">
            <span>user: {user?.username ?? "—"}</span>
            <span>role: {profile?.role  ?? "—"}</span>
            <span>profile loaded: {profile ? "yes" : "no"}</span>
        </div>
    ) : null;

    // Return UI component
    return (
    <>
        {/* Headers */}
        {DevBar}
        {pageHeader}
    
        {/* Routed page component */}
        <main className="px-[1rem]"> <Outlet /> </main>
    </>
    );
}
