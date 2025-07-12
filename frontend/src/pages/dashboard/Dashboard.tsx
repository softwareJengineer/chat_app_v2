import ProfileBar       from "@/components/user-info/ProfileBar";
import ChatHistory      from "./components/ChatHistory";
import PerformanceTrack from "./components/PerformanceTrack";

// Dashboard ("Speech Analysis" page)
export function Dashboard() {
    return (
        <>  
            <ProfileBar/>
            <PerformanceTrack/>
            <ChatHistory/>
        </>
    );
}
