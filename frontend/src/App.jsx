import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider            } from "@/context/AuthProvider";

import Protected       from "@/routes/Protected";
import AppLayout       from "@/routes/AppLayout";
import Chat            from "@/pages/Chat";
import Login           from "@/pages/Login";
import SignUp          from "@/pages/SignUp";
import Schedule        from "@/pages/Schedule";
import Dashboard       from "@/pages/Dashboard";
import Home            from "@/pages/Home";
import ChatDetails     from "@/pages/ChatDetails";
import Analysis        from "@/pages/Analysis";
import ProgressSummary from "@/pages/ProgressSummary";

// --------------------------------------------------------------------
// Routes and Pages
// --------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}> 

            {/* Public Routes */}
            <Route path="/"        element={<Home   />} />
            <Route path="/login"   element={<Login  />} />
            <Route path="/signup"  element={<SignUp />} />

            {/* Protected Routes */}
            <Route element={<Protected />}>
                {/* Patient */}
                <Route path="/chat"     element={<Chat            />} />
                <Route path="/progress" element={<ProgressSummary />} />
                {/* ChatHistory is just the dashboard without the performance graphs showing */}

                {/* Caregiver */}
                <Route path="/dashboard"   element={<Dashboard   />} />
                <Route path="/chatdetails" element={<ChatDetails />} />

                {/* Shared */}
                <Route path="/schedule" element={<Schedule    />} />
                <Route path="/analysis" element={<Analysis    />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
        </Route>

      </Routes>
    </AuthProvider>
  );
}
