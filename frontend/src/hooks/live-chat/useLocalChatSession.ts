import { useState } from "react";

// Models for frontend display use only
export interface LocalChatSession {
    id      : string;                // random UUID until backend assigns
    messages: LocalChatMessage[];
    started : string; 
}
export interface LocalChatMessage {
    id     : string;
    ts     : string;
    role   : "user" | "assistant";
    content: string;
}

// --------------------------------------------------------------------
// Handle local storage of chat session data
// --------------------------------------------------------------------
export function useLocalChatSession () {
    // State variable
    const [session, setSession] = useState<LocalChatSession>({id: crypto.randomUUID(), messages: [], started: new Date().toISOString() });

    // Update the state using this
    const pushMessage = (role: "user" | "assistant", content: string) =>
        setSession((s) => ({...s, messages: [...s.messages, { id: crypto.randomUUID(), ts: new Date().toISOString(), role, content }],
    }));

    return { pushMessage, session };
}
