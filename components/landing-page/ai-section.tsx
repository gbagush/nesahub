"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

import React, { useState } from "react";

import Image from "next/image";
import DeepSeekLogo from "@/public/DeepSeek.png";
import OxaLogo from "@/public/oxa.svg";
import Link from "next/link";
import { Avatar } from "@heroui/avatar";
import { Textarea } from "@heroui/input";
import {
  Bookmark,
  Dot,
  ImageIcon,
  MessageSquare,
  Repeat,
  Share,
  Smile,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { IconGif } from "@tabler/icons-react";
import { Button } from "@heroui/button";

export const AISection = () => {
  const [isJohnDoePosted, setIsJohnDoePosted] = useState(false);
  const [isOXAAIPosted, setIsOXAAIPosted] = useState(false);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 z-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-neutral-950"></div>

      <div className="relative z-20 text-center mb-16 px-4">
        <Image
          src={OxaLogo}
          alt="Oxa Logo"
          className="h-12 w-auto mx-auto mb-8 invert-0 dark:invert"
          height={128}
          width={0}
        />
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Leverage <span className="font-semibold text-foreground">OXA AI</span>{" "}
          to get intelligent, contextual replies on your posts instantly.
          Enhance your conversations with AI-powered insights that keep
          engagement flowing naturally.
        </p>
        <span className="flex text-sm items-center gap-2 w-full justify-center py-2">
          Powered by{" "}
          <Link href="https://www.deepseek.com/" target="_blank">
            <Image
              src={DeepSeekLogo}
              alt="DeepSeek Logo"
              height={128}
              width={0}
              className="h-4 w-auto"
            />
          </Link>
        </span>

        <div className="max-w-xl mx-auto rounded-3xl my-4 text-start border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
          <PostCard
            name="Jane Doe"
            username="JaneDoe"
            time="about an hour ago"
            content={
              <p className="text-sm whitespace-pre-line break-words">
                Is Nesahub using LLMs or just rule-based bots?
              </p>
            }
            comments={15}
            likes={256}
            dislikes={2}
            reposts={12}
            bookmarks={8}
          />

          <div className="flex gap-4 py-4 border-b-1 border-foreground-100">
            <div>
              <Avatar src="https://api.dicebear.com/9.x/glass/svg?seed=Emery" />
            </div>
            <div className="w-full">
              <Textarea
                variant="underlined"
                placeholder="Reply this post"
                minRows={1}
                classNames={{
                  inputWrapper: "border-b-1 border-foreground-100",
                }}
                className="mb-4"
                value={isJohnDoePosted ? "" : "@oxa clarify?"}
                isReadOnly
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-4">
                  <button>
                    <ImageIcon size={20} />
                  </button>
                  <button>
                    <Smile size={20} />
                  </button>
                  <button>
                    <IconGif size={20} />
                  </button>
                </div>
                <Button
                  className="font-semibold"
                  radius="full"
                  variant="ghost"
                  onPress={() => {
                    setIsJohnDoePosted(true);
                    setTimeout(() => {
                      setIsOXAAIPosted(true);
                    }, 500);
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>

          {isJohnDoePosted && (
            <PostCard
              name="John Doe"
              username="JohnDoe"
              time="less than a minute"
              avatarUrl="https://api.dicebear.com/9.x/glass/svg?seed=Emery"
              content={
                <p className="text-sm whitespace-pre-line break-words">
                  <span className="text-primary">@oxa </span>
                  clarify
                </p>
              }
              comments={0}
              likes={0}
              dislikes={0}
              reposts={0}
              bookmarks={0}
            />
          )}

          {isOXAAIPosted && (
            <PostCard
              name="OXA AI"
              username="oxa"
              time="less than a minute"
              avatarUrl="https://nhdevcdn.zeth.biz.id/images/OXA.png "
              content={
                <p className="text-sm whitespace-pre-line break-words">
                  {"Great question. OXA is powered by advanced language models (LLMs), not rule-based bots. That means responses are dynamic, context-aware, and continuously improving."
                    .split(" ")
                    .map((word, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.07,
                          ease: "easeOut",
                        }}
                        className="inline-block mr-1"
                      >
                        {word}
                      </motion.span>
                    ))}
                </p>
              }
              reply="JohnDoe"
              comments={0}
              likes={0}
              dislikes={0}
              reposts={0}
              bookmarks={0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PostCard = ({
  avatarUrl = "https://api.dicebear.com/9.x/glass/svg?seed=Jack",
  name,
  username,
  time,
  content,
  reply,
  comments = 0,
  likes = 0,
  dislikes = 0,
  reposts = 0,
  bookmarks = 0,
}: {
  avatarUrl?: string;
  name: string;
  username: string;
  time: string;
  content: React.ReactNode;
  reply?: string;
  comments?: number;
  likes?: number;
  dislikes?: number;
  reposts?: number;
  bookmarks?: number;
}) => {
  return (
    <div className="flex gap-4 items-start w-full border-b-1 py-4 border-foreground-100">
      <div>
        <Avatar src={avatarUrl} />
      </div>
      <div className="w-full">
        <div className="flex flex-wrap items-center text-sm break-words">
          <span className="font-semibold">{name}</span>
          <span className="ml-1 text-foreground-500">@{username}</span>
          <Dot className="text-foreground-500" size={20} />
          <span className="ml-1 text-foreground-500">{time}</span>
        </div>
        {reply && (
          <p className="text-sm text-foreground-500">
            Reply <span className="text-primary">@{reply}</span>
          </p>
        )}
        {content}
        <div className="flex justify-between mt-4">
          <button className="flex items-center gap-1 hover:text-red-500">
            <MessageSquare size={16} />
            <span className="text-xs">{comments}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <ThumbsUp size={16} />
            <span className="text-xs">{likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <ThumbsDown size={16} />
            <span className="text-xs">{dislikes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <Repeat size={16} />
            <span className="text-xs">{reposts}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <Bookmark size={16} />
            <span className="text-xs">{bookmarks}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-red-500">
            <Share size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
