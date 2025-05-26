"use client";
import { useSocket } from "@/providers/socket-provider";
import { Participant } from "@/types/conversation";
import { Textarea } from "@heroui/input";
import { SendHorizonal } from "lucide-react";
import { useState, useRef } from "react";
import { ChatEmojiPopover } from "./chat-emoji-popover";

export const ChatInput = ({
  targetUser,
  handleSendMessage,
}: {
  targetUser: Participant | undefined;
  handleSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const { emit } = useSocket();

  const lastEmitTime = useRef<number>(0);

  const sendTyping = () => {
    if (!targetUser?.user.clerk_id) return;

    const now = Date.now();
    if (now - lastEmitTime.current > 1000) {
      emit("typing", {
        userId: targetUser.user.clerk_id,
        data: { isTyping: true },
      });
      lastEmitTime.current = now;
    }
  };

  const send = () => {
    if (!message.trim()) return;
    handleSendMessage(message.trim());
    setMessage("");
    lastEmitTime.current = 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    sendTyping();
  };

  return (
    <div className="sticky bottom-0 border-t border-foreground-100 px-4 py-2 bg-background">
      <div className="flex gap-2">
        <ChatEmojiPopover
          onEmojiClick={(emoji) => setMessage((prev) => prev + emoji)}
        />
        <Textarea
          variant="bordered"
          minRows={1}
          classNames={{ inputWrapper: "border-1" }}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button className="text-foreground hover:text-primary" onClick={send}>
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
};
