import React, { createContext, useContext, useState } from "react";
import { Spinner } from "../components/Spinner";

import { setAccess, User, Profile, getProfile } from "../api"
import * as authApi  from "../api/auth";

// Create the context (describes what any component will get when it calls useAuth())
interface AuthCtx { user?: User; profile?: Profile, login(username: string, password: string): Promise<void>; logout(): void; }
const AuthContext = createContext<AuthCtx>(null!);

// ====================================================================
// AuthProvider 
// ====================================================================
// Local state only holds User & Profile data, client.ts manages access tokens.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user,    setUser   ] = useState<User   >();
    const [profile, setProfile] = useState<Profile>();
    const [error,   setError  ] = useState<string >(); 
    const [loading, setLoading] = useState(false);

    // Login
    const login  = async (username: string, password: string) => {
        try {
            // POST to /token/ & get Token/User information
            setLoading(true);
            const response = await authApi.login(username, password);  // { access, refresh, user }
            setAccess(response.access);
            setUser  (response.user  ); 

            // Fetch user profile; blocks until the profile returns and we have data to populate pages
            await getProfile().then(setProfile).catch(console.error);

        } catch (err) { setError((err as Error).message); throw err; 
        } finally     { setLoading(false); }
    };

    // Logout (reset the User and Profile to undefined)
    const logout = () => { setAccess(undefined); setUser(undefined); setProfile(undefined); };

    // Return AuthContext
    return (
        <AuthContext.Provider value={{ user, profile, login, logout }}>
            {children}
            {loading && <Spinner/>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
