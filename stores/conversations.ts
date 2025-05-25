import { create } from "zustand";
import { Conversation } from "@/types/conversation";

interface ConversationsState {
  conversations: Conversation[];
  setConversations: (
    conversations: Conversation[] | ((prev: Conversation[]) => Conversation[])
  ) => void;
}

export const useConversations = create<ConversationsState>((set) => ({
  conversations: [],
  setConversations: (conversations) =>
    set((state) => ({
      conversations:
        typeof conversations === "function"
          ? conversations(state.conversations)
          : conversations,
    })),
}));
