"use client";
import axios from "axios";
import dynamic from "next/dynamic";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { addToast } from "@heroui/toast";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Image, Smile } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Textarea } from "@heroui/input";

import { Theme } from "emoji-picker-react";

import type { Post } from "@/types/post";

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

  const { user } = useUser();

  const { theme } = useTheme();

  const handleCreatePost = async () => {
    if (content.length < 10 || content.length > 5000) {
      addToast({
        title: "Error",
        description: "Post must be between 10 and 5000 characters.",
        color: "danger",
      });
      return;
    }

    try {
      const response = await axios.post("/api/posts", {
        parent_id: parentId,
        content,
      });

      if (response.status === 201) {
        addToast({
          title: "Success",
          description: "Post created successfully.",
          color: "success",
        });
        setContent("");
      }

      onNewPost(response.data.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create post.";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
      });
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
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <button>
                    <Image size={20} />
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
                </div>

                <Button
                  className="font-semibold"
                  radius="full"
                  isDisabled={content.length < 10 || content.length > 5000}
                  onPress={handleCreatePost}
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
