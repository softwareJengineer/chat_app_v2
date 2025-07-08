import { request     } from "../client";
import { ChatSession } from "../models";

// GET
export const listChatSessions = () => request<ChatSession[]>("/chatsessions/");
