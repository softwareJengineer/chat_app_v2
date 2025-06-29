// src/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { RUN_ENV } from "../utils/constants";

export default function AppLayout() {
    const { user, profile } = useAuth();

    // --------------------------------------------------------------------
    // Small dev bar only shown in development builds
    // --------------------------------------------------------------------
    const DevBar = (RUN_ENV == "DEV") ? (
        <div className="bg-yellow-100 px-4 py-1 text-xs flex gap-4">
            <span>user: {user?.username ?? "—"}</span>
            <span>role: {user?.is_staff ? "caregiver" : "plwd"}</span>
            <span>profile loaded: {profile ? "yes" : "no"}</span>
        </div>
    ) : null;

    const pageHeader = (
        <header className="flex items-center gap-4 p-3 shadow">
            <h1 className="text-lg font-bold grow">Cognibot</h1>
            {user && <span>{user.first_name}</span>}
        </header>
    )

    // --------------------------------------------------------------------
    // HTML Content
    // --------------------------------------------------------------------
    return (<>
        {DevBar}
        {/* pageHeader */}
            
        {/* Here the page routed component will appear */}
        <main className="p-4"> <Outlet /> </main>
        </>
    );
}
