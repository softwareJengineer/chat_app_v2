
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthProvider";

import Header           from "@/components/Header";
import ChatHistory      from "@/components/chats/ChatHistory";
import PerformanceTrack from "@/components/PerformanceTrack";

// ====================================================================
// Dashboard
// ====================================================================
/*  Page Layout
    ------------
    * Header
    * User info (caregiver/patient)

*/
export default function Dashboard() {
    const { user, profile } = useAuth();


    return (
    <>  
        {/* Header */}
        <Header/>

        {/* Performance Track */}
        <PerformanceTrack/>

        {/* Chat History Cards */}
        <ChatHistory/>
    
    
    </>
    );

    return (
        <>
            {/* Header (needs to be redone) */}
            <Header title="Speech Analysis" page="dashboard" />

            
            {/* User Info Stuff */}
            <div className="mx-[2rem] mb-[2rem] flex flex-col gap-2">
                <div className="flex items-center gap-4 align-middle">
                    <FaUser size={50} color="purple" />
                    <p className="align-middle">{profile.caregiverFirstName} {profile.caregiverLastName}</p>
                    Care Partner
                    <FaUser size={50} color="green" />
                    <p className="align-middle">{profile.plwdFirstName} {profile.plwdLastName}</p>
                    <div className="flex float-right ml-auto">
                        <button
                            className="text-violet-600 border-1 border-violet-600 p-2 rounded hover:bg-violet-600 hover:text-white duration-200"
                        >
                            Download Report
                        </button>
                    </div>
                </div>
                <Link to="/settings" className={"caregiver-link"}>
                    Update profile
                </Link>
            </div>




        </>
    );



}
