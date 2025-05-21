"use client";
import axios from "axios";
import dynamic from "next/dynamic";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { addToast } from "@heroui/toast";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Image as ImageIcon, Smile, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Textarea } from "@heroui/input";

import { Theme } from "emoji-picker-react";

import type { Post } from "@/types/post";
import { GifPopover } from "./post-gif-popover";
import Image from "next/image";

const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

export const CreatePostForm = ({
  parentId,
  onNewPost,
}: {
  parentId?: Number;
  onNewPost: (newPost: Post) => void;
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [gif, setGif] = useState("");

  const { user } = useUser();

  const { theme } = useTheme();

  const handleCreatePost = async () => {
    if (!gif && (content.length < 10 || content.length > 5000)) {
      addToast({
        description:
          "Post must have media or content length between 10 and 5000 characters.",
        color: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/posts", {
        parent_id: parentId,
        content,
        giphy: gif,
      });

      if (response.status === 201) {
        addToast({
          description: "Post created successfully.",
          color: "success",
        });
        setContent("");
        setGif("");
      }

      onNewPost(response.data.data);
    } catch (error: any) {
      addToast({
        description: error.response?.data?.message || "Failed to create post.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full border-b-1 border-foreground-100">
      {user && (
        <>
          <div className="flex gap-4">
            <div>
              <Avatar src={user.imageUrl} />
            </div>
            <div className="w-full">
              <Textarea
                variant="underlined"
                placeholder={parentId ? "Post your reply" : "What's happening?"}
                minRows={1}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                classNames={{
                  inputWrapper: "border-b-1 border-foreground-100",
                }}
                className="mb-4"
              />

              {gif && (
                <div className="relative inline-block">
                  <Image
                    src={gif}
                    alt="GIF"
                    width={256}
                    height={0}
                    className="h-auto w-64 rounded-lg"
                    loading="lazy"
                    unoptimized
                  />
                  <button
                    onClick={() => setGif("")}
                    className="absolute top-1 right-1 bg-foreground bg-opacity-50 rounded-full p-1 hover:bg-opacity-100 transition"
                  >
                    <X size={20} className="text-background" />
                  </button>
                  <Image
                    src="/powered-by-giphy-icon.png"
                    alt="Powered by GIPHY"
                    width={60}
                    height={32}
                    className="absolute bottom-2 left-2 "
                  />
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <button>
                    <ImageIcon size={20} />
                  </button>
                  <Popover
                    placement="bottom"
                    classNames={{
                      content: "p-0 border-0",
                    }}
                  >
                    <PopoverTrigger>
                      <button>
                        <Smile size={20} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <EmojiPicker
                        theme={
                          theme === "dark"
                            ? ("dark" as Theme)
                            : ("light" as Theme)
                        }
                        onEmojiClick={(emoji) => {
                          setContent(content + emoji.emoji);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <GifPopover onSelected={(gif) => setGif(gif)} />
                </div>

                <Button
                  className="font-semibold"
                  radius="full"
                  variant="ghost"
                  isDisabled={
                    !gif && (content.length < 10 || content.length > 5000)
                  }
                  onPress={handleCreatePost}
                  isLoading={loading}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
