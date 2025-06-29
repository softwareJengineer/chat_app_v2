import { useAuth } from "@/context/AuthProvider";
import   UserCard  from "@/components/user-info/UserCard";

// Profile info bar
export default function ProfileBar() { 
    const { profile } = useAuth();

    // Download report utility
    const downloadReport = () => {console.log("downloadReport() not implemented yet...")}

    // Return UI component
    const buttonStyle = "ml-auto text-violet-600 border-1 border-violet-600 p-2 rounded hover:bg-violet-600 hover:text-white duration-200";
    return (
    <div className="p-[1rem] flex items-center gap-4 align-middle">
            <UserCard user={profile.plwd} big={true} />
            <button onClick={downloadReport} className={buttonStyle}> Download Report </button>
        </div>
    );
}
