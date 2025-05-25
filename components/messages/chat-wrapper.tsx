"use client";

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { useInView } from "react-intersection-observer";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import Link from "next/link";

import { addToast } from "@heroui/toast";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Textarea } from "@heroui/input";

import { ChatBubble } from "./chat-bubble";
import { NotFoundSection } from "../commons/navigations/social/not-found-section";

import type { Conversation, Message } from "@/types/conversation";
import { useSocket } from "@/providers/socket-provider";

export const ChatWarpper = ({ conversationId }: { conversationId: number }) => {
  const [conversation, setConversation] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const { user } = useUser();

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { on } = useSocket();

  const [topRef, topInView] = useInView({
    threshold: 0.5,
  });

  const handleSendMessage = async () => {
    try {
      const result = await axios.post(
        `/api/conversations/${conversationId}/messages/`,
        {
          content: message,
        }
      );

      setMessage("");

      setMessages((prev) => {
        const container = scrollContainerRef.current;
        const isAlreadyAtBottom =
          container &&
          container.scrollHeight - container.scrollTop <=
            container.clientHeight + 50;

        const next = [...prev, result.data.data];

        setTimeout(() => {
          if (isAlreadyAtBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);

        return next;
      });
    } catch (error) {
      addToast({
        description: "Failed to send message",
        color: "danger",
      });
    }
  };

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

  const getMessages = async (pageNum = 1) => {
    try {
      const result = await axios.get(
        `/api/conversations/${conversationId}/messages?page=${pageNum}`
      );

      if (result.data.data.length === 0 || result.data.data.length < 10) {
        setHasMore(false);
      }

      if (pageNum === 1) {
        setMessages(result.data.data);
      } else {
        const container = scrollContainerRef.current;

        let prevScrollHeight = 0;
        if (container) {
          prevScrollHeight = container.scrollHeight;
        }

        setMessages((prev) => [...result.data.data, ...prev]);

        setTimeout(() => {
          if (container && prevScrollHeight > 0) {
            const newScrollHeight = container.scrollHeight;
            const offset = newScrollHeight - prevScrollHeight;
            container.scrollTop += offset;
          }
        }, 0);
      }
    } catch (error) {
      setIsError(true);
      addToast({
        description: "Failed to load older messages",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    getConversationDetail();
    getMessages(page);
  }, []);

  useEffect(() => {
    if (
      !loading &&
      messages.length > 0 &&
      messagesEndRef.current &&
      autoScrollEnabled
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, messages]);

  useEffect(() => {
    if (topInView && hasMore && !loadingMore && initialLoadComplete) {
      const loadOlderMessages = async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        await getMessages(nextPage);
        setPage(nextPage);
        setLoadingMore(false);
      };

      loadOlderMessages();
    }
  }, [topInView]);

  const handleScroll = () => {
    if (!initialLoadComplete || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const threshold = 100;
    const isNearBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + threshold;

    if (!isNearBottom) {
      setAutoScrollEnabled(false);
    }
  };

  const otherParticipant =
    conversation &&
    conversation.participants.find((p) => p.user.username !== user?.username);

  on("incoming-message", (payload) => {
    console.log("Received incoming message:", payload);

    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === payload.id);

      if (exists) {
        return prev;
      }

      const container = scrollContainerRef.current;
      const isAlreadyAtBottom =
        container &&
        container.scrollHeight - container.scrollTop <=
          container.clientHeight + 50;

      if (isAlreadyAtBottom && messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
      } else {
        setAutoScrollEnabled(false);
      }

      return [...prev, payload];
    });
  });

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
          <div className="flex flex-col h-screen max-lg:h-[calc(100vh-64px)]">
            <div className="sticky top-0 border-b border-foreground-100 px-4 py-2 z-50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button onClick={() => router.back()}>
                  <ArrowLeft size={20} />
                </button>
                <Link
                  href={`/user/${otherParticipant?.user.username}`}
                  className="flex gap-2 items-center"
                >
                  <Avatar
                    src={otherParticipant?.user.profile_pict}
                    alt="User Avatar"
                  />
                  <span className="font-semibold">
                    {otherParticipant?.user.first_name}{" "}
                    {otherParticipant?.user.last_name}
                  </span>
                </Link>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex flex-col p-4 w-full h-full overflow-y-auto"
              onScroll={handleScroll}
            >
              <div className="flex flex-col items-center w-full gap-2 pb-4 border-b-1 border-foreground-100">
                <Avatar
                  src={otherParticipant?.user.profile_pict}
                  alt="User Avatar"
                  size="lg"
                />
                <span className="flex flex-col items-center font-semibold">
                  {otherParticipant?.user.first_name}{" "}
                  {otherParticipant?.user.last_name}
                  <span className="text-sm font-normal text-foreground-500">
                    @{otherParticipant?.user.username}
                  </span>
                </span>
                <Button
                  as={Link}
                  href={`/user/${otherParticipant?.user.username}`}
                  size="sm"
                  variant="bordered"
                >
                  View profile
                </Button>
              </div>

              {loadingMore && (
                <div className="flex justify-center my-2">
                  <Spinner size="sm" />
                </div>
              )}

              {initialLoadComplete && (
                <div ref={topRef} className="h-px w-full" />
              )}

              {messages.map((message, index) => {
                const currentDate = new Date(message.created_at);
                const previousMessage = messages[index - 1];
                const previousDate = previousMessage
                  ? new Date(previousMessage.created_at)
                  : null;

                const showDate =
                  !previousDate || !isSameDay(currentDate, previousDate);

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-foreground-500 my-2">
                        {format(currentDate, "d MMMM yyyy")}
                      </div>
                    )}
                    <ChatBubble
                      content={message.content}
                      created_at={message.created_at}
                      isSender={message.sender.username === user?.username}
                    />
                  </React.Fragment>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 border-t border-foreground-100 px-4 py-2 bg-background">
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
          </div>
        </>
      )}
    </>
  );
};
