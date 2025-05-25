"use client";

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { useInView } from "react-intersection-observer";
import { useUser } from "@clerk/nextjs";

import { useSocket } from "@/providers/socket-provider";
import { useConversations } from "@/stores/conversations";

import { addToast } from "@heroui/toast";
import { SendHorizonal } from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Textarea } from "@heroui/input";

import { ChatBubble } from "./chat-bubble";
import { UserBanner } from "./user-banner";
import { ChatHeader } from "./chat-header";

import { NotFoundSection } from "../commons/navigations/social/not-found-section";

import type { Conversation, Message } from "@/types/conversation";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";

export const ChatWarpper = ({ conversationId }: { conversationId: number }) => {
  const [conversation, setConversation] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { user } = useUser();
  const { setConversations } = useConversations();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { on } = useSocket();

  const [topRef, topInView] = useInView({
    threshold: 0.5,
  });

  const handleSendMessage = async (message: string) => {
    try {
      const result = await axios.post(
        `/api/conversations/${conversationId}/messages/`,
        {
          content: message,
        }
      );

      const newMessage: Message = result.data.data;

      setConversations((prev: Conversation[]) => {
        return [...prev]
          .map((conv) => {
            if (conv.id === newMessage.conversationId) {
              return {
                ...conv,
                updated_at: new Date().toISOString(),
                messages: [newMessage, ...conv.messages],
              };
            }
            return conv;
          })
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
      });

      setMessages((prev) => {
        const container = scrollContainerRef.current;
        const isAlreadyAtBottom =
          container &&
          container.scrollHeight - container.scrollTop <=
            container.clientHeight + 50;

        const next = [...prev, newMessage];

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

  on("incoming-message", (payload: { message: Message }) => {
    const message = payload.message;

    if (message.senderId !== otherParticipant?.user.id) {
      return;
    }

    setIsTyping(false);

    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === message.id);

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

      return [...prev, message];
    });
  });

  on("typing", (payload: { from: string; data: { isTyping: boolean } }) => {
    if (
      payload.from === otherParticipant?.user.clerk_id &&
      payload.data?.isTyping
    ) {
      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
      }, 1500);
    }
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
        <div className="flex flex-col h-screen max-lg:h-[calc(100vh-64px)]">
          <ChatHeader otherParticipant={otherParticipant} />

          <div
            ref={scrollContainerRef}
            className="flex flex-col p-4 w-full h-full overflow-y-auto"
            onScroll={handleScroll}
          >
            <UserBanner otherParticipant={otherParticipant || undefined} />

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

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            targetUser={otherParticipant}
            handleSendMessage={(message) => handleSendMessage(message)}
          />
        </div>
      )}
    </>
  );
};
