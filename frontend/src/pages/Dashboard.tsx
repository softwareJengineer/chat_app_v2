import ProfileBar       from "@/components/user-info/ProfileBar";
import ChatHistory      from "@/components/chats/ChatHistory";
import PerformanceTrack from "@/components/PerformanceTrack";

// Dashboard ("Speech Analysis" page)
export default function Dashboard() {
    return (
        <>  
            <ProfileBar/>
            <PerformanceTrack/>
            <ChatHistory/>
        </>
    );
}
