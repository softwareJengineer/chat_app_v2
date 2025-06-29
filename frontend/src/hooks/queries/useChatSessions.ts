import   toast       from "react-hot-toast";
import { useEffect } from "react";
import { useQuery  } from "@tanstack/react-query";
import { ChatSession, listChatSessions } from "@/api";

// Hook to wrap useQuery for retrieving ChatSession objects
export function useChatSessions() {
    const query = useQuery<ChatSession[], Error>({
        queryKey : ["chatSessions"],  // Cache key
        queryFn  : listChatSessions,  // Returns Promise<ChatSession[]>
        staleTime: 1000 * 60 * 5,     // Cache cleared 5 min after component unloads
    });

    // Error handling
    useEffect(() => {
        if (query.isError) toast.error(query.error.message);
    }, [query.isError, query.error]);

    // Return
    return {...query, data: query.data ?? [],};
}
