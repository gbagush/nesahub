"use client";
import axios from "axios";
import dynamic from "next/dynamic";

import Image from "next/image";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { addToast } from "@heroui/toast";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { GifPopover } from "./post-gif-popover";
import { Image as ImageIcon, Smile, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Textarea } from "@heroui/input";

import { Theme } from "emoji-picker-react";
import type { Post } from "@/types/post";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

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
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { theme } = useTheme();

  const handleCreatePost = async () => {
    if (
      !gif &&
      (content.length < 10 || content.length > 5000) &&
      mediaFiles.length === 0
    ) {
      addToast({
        description:
          "Post must have media, a GIF, or content length between 10 and 5000 characters.",
        color: "danger",
      });
      return;
    }

    if (mediaFiles.length > 3) {
      addToast({ description: "Max 3 images allowed.", color: "danger" });
      return;
    }

    for (const file of mediaFiles) {
      if (file.size > 1024 * 1024) {
        addToast({
          description: `${file.name} exceeds the 1MB limit.`,
          color: "danger",
        });
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", content);
      if (parentId) formData.append("parent_id", parentId.toString());
      if (gif) formData.append("giphy", gif);
      mediaFiles.forEach((file) => formData.append("media", file));

      const response = await axios.post("/api/posts", formData);

      if (response.status === 201) {
        addToast({
          description: "Post created successfully.",
          color: "success",
        });
        setContent("");
        setGif("");
        setMediaFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onNewPost(response.data.data);
      }
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
        <div className="flex gap-4">
          <Avatar src={user.imageUrl} />
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

            {mediaFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {mediaFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded overflow-hidden"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                    <button
                      className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full"
                      onClick={() =>
                        setMediaFiles((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-4">
                <button onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={20} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    const newFiles = Array.from(files);
                    setMediaFiles((prev) => [...prev, ...newFiles].slice(0, 3));
                  }}
                />

                <Popover
                  placement="bottom"
                  classNames={{ content: "p-0 border-0" }}
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
                      onEmojiClick={(emoji) =>
                        setContent(content + emoji.emoji)
                      }
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
                  !gif &&
                  mediaFiles.length === 0 &&
                  (content.length < 10 || content.length > 5000)
                }
                onPress={handleCreatePost}
                isLoading={loading}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
