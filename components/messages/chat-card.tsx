"use client";
import Link from "next/link";
import { Avatar } from "@heroui/avatar";
import type { Conversation, Participant } from "@/types/conversation";

export const ChatCard = ({
  conversation,
  otherParticipant,
}: {
  conversation: Conversation;
  otherParticipant: Participant;
}) => {
  const latestMessage = conversation.messages[0];
  const isUnread = latestMessage?.senderId === otherParticipant.userId;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-2 w-full"
    >
      <div>
        <Avatar src={otherParticipant.user.profile_pict} />
      </div>
      <div className="flex flex-col min-w-0 w-full">
        <div className="flex flex-wrap items-center text-sm break-words">
          <span className="font-semibold">
            {otherParticipant.user.first_name} {otherParticipant.user.last_name}
          </span>
          <span className="text-foreground-500 ml-1">
            @{otherParticipant.user.username}
          </span>
        </div>
        <span
          className={`flex items-center justify-between text-sm truncate ${
            isUnread ? "font-semibold text-foreground" : "text-foreground-500"
          }`}
        >
          {latestMessage?.content || "Send first message"}

          {isUnread && (
            <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
          )}
        </span>
      </div>
    </Link>
  );
};
