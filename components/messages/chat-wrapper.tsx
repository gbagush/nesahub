"use client";
import axios from "axios";
import { useEffect, useState } from "react";

import { Textarea } from "@heroui/input";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { addToast } from "@heroui/toast";
import { Conversation, Message } from "@/types/conversation";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { useUser } from "@clerk/nextjs";
import { NotFoundSection } from "../commons/navigations/social/not-found-section";
import { ChatBubble } from "./chat-bubble";
import { useRouter } from "next/navigation";

export const ChatWarpper = ({ conversationId }: { conversationId: number }) => {
  const [conversation, setConversation] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const { user } = useUser();

  const router = useRouter();

  const handleSendMessage = async () => {
    try {
      const result = await axios.post(
        `/api/conversations/${conversationId}/messages/`,
        {
          content: message,
        }
      );

      setMessage("");

      setMessages((prev) => [...prev, result.data.data]);
    } catch (error) {
      addToast({
        description: "Failed to send message",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    const getConversationDetail = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`/api/conversations/${conversationId}`);

        setConversation(result.data.data);
      } catch (error) {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    const getMessages = async () => {
      try {
        const result = await axios.get(
          `/api/conversations/${conversationId}/messages`
        );

        setMessages(result.data.data);
      } catch (error) {
        setIsError(true);
      }
    };

    getConversationDetail();
    getMessages();
  }, []);

  const otherParticipant =
    conversation &&
    conversation.participants.find((p) => p.user.username !== user?.username);

  return (
    <>
      {loading && <Spinner className="py-4" />}

      {isError && (
        <NotFoundSection
          page="Message"
          title="Conversation not found"
          description="The conversation you are looking for does not exist."
        />
      )}

      {conversation && (
        <>
          <div className="sticky top-0 border-b border-foreground-100 px-4 py-2">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()}>
                <ArrowLeft size={20} />
              </button>
              <Avatar
                src={otherParticipant?.user.profile_pict}
                alt="User Avatar"
              />
              <span className="font-semibold">
                {otherParticipant?.user.first_name}{" "}
                {otherParticipant?.user.last_name}
              </span>
            </div>
          </div>
          <div className="flex flex-col p-4 w-full h-full overflow-y-auto">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                content={message.content}
                isSender={message.sender.username === user?.username}
              />
            ))}
          </div>
          <div className="sticky bottom-0 border-t border-foreground-100 px-4 py-2">
            <div className="flex gap-2">
              <Textarea
                variant="bordered"
                minRows={1}
                classNames={{
                  inputWrapper: "border-1",
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="text-foreground hover:text-primary"
                onClick={handleSendMessage}
              >
                <SendHorizonal size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
