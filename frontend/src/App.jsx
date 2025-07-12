import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider            } from "@/context/AuthProvider";

import { Unprotected, Protected, AppLayout } from "@/routes";

import { Dashboard, ChatDetails } from "@/pages";
import Chat            from "@/pages/Chat";
import Login           from "@/pages/Login";
import SignUp          from "@/pages/SignUp";
import Schedule        from "@/pages/Schedule";
import ProgressSummary from "@/pages/ProgressSummary";


// --------------------------------------------------------------------
// Routes and Pages
// --------------------------------------------------------------------
// ToDo: Add a patient/caregiver Route to this as well
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}> 

            {/* Public Routes */}
            <Route element={ <Unprotected/> }> 
                <Route path="/login"   element={<Login  />} />
                <Route path="/signup"  element={<SignUp />} />
            </Route>

            {/* Protected Routes */}
            <Route element={ <Protected/> }>
                {/* Patient */}
                <Route path="/chat"     element={<Chat            />} />
                <Route path="/progress" element={<ProgressSummary />} />

                {/* Caregiver */}
                <Route path="/dashboard"   element={<Dashboard   />} />
                <Route path="/chatdetails" element={<ChatDetails />} />

                {/* Shared */}
                <Route path="/schedule" element={<Schedule    />} />
                
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            
        </Route>

      </Routes>
    </AuthProvider>
  );
}
