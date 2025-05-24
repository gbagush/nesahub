"use client";
import axios from "axios";
import { useState, useEffect } from "react";

import { Input } from "@heroui/input";
import { Search } from "lucide-react";

import { ChatCard } from "./chat-card";
import { addToast } from "@heroui/toast";
import type { Conversation } from "@/types/conversation";
import { Spinner } from "@heroui/spinner";
import { useUser } from "@clerk/nextjs";

export const ChatList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUser();

  useEffect(() => {
    const getConversations = async () => {
      try {
        setLoading(true);
        const result = await axios.get("/api/conversations");
        setConversations(result.data.data);
      } catch (error) {
        addToast({
          description: "Failed getting conversations",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full lg:w-2/5 lg:border-l lg:border-foreground-100 pb-[72px] lg:pb-0 p-4">
      <h4 className="font-semibold text-xl">Messages</h4>

      <Input
        radius="full"
        placeholder="Search messages"
        variant="bordered"
        startContent={<Search size={16} />}
      />

      {loading && <Spinner className="py-4" />}

      {!loading &&
        conversations.length > 0 &&
        conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p) => p.user.username !== user?.username
          );

          if (!otherParticipant) return null;

          return (
            <ChatCard
              key={conversation.id}
              id={conversation.id}
              username={otherParticipant.user.username}
              name={`${otherParticipant.user.first_name} ${otherParticipant.user.last_name}`}
              profile_picture={otherParticipant.user.profile_pict}
              message={
                conversation.messages[0]
                  ? conversation.messages[0].content
                  : "Send first message"
              }
            />
          );
        })}
    </div>
  );
};
