"use client";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
import type { Post, PostMedia } from "@/types/post";
import type { User } from "@/types/user";
import { User as HeroUIUser } from "@heroui/user";
import { useRouter } from "next/navigation";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export const EditPostForm = ({
  post,
  onPostUpdated,
}: {
  post: Post;
  onPostUpdated?: (updatedPost: Post) => void;
}) => {
  const [content, setContent] = useState(post.content || "");
  const [loading, setLoading] = useState(false);
  const [gif, setGif] = useState(
    post.media?.find((m) => m.source === "GIPHY")?.path || ""
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<PostMedia[]>(
    post.media ?? []
  );
  const [keepMediaIds, setKeepMediaIds] = useState<number[]>(
    post.media?.map((m) => m.id) ?? []
  );
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { theme } = useTheme();

  const router = useRouter();

  useEffect(() => {
    setContent(post.content || "");
    const giphyMedia = post.media?.find((m) => m.source === "GIPHY");
    setGif(giphyMedia?.path || "");
    setExistingMedia(post.media || []);
    setKeepMediaIds(post.media?.map((m) => m.id) ?? []);
  }, [post]);

  const handleUpdatePost = async () => {
    if (
      !gif &&
      (content.length < 10 || content.length > 5000) &&
      mediaFiles.length === 0 &&
      keepMediaIds.length === 0
    ) {
      addToast({
        description:
          "Post must have media, a GIF, or content length between 10 and 5000 characters.",
        color: "danger",
      });
      return;
    }

    if (mediaFiles.length + keepMediaIds.length + (gif ? 1 : 0) > 3) {
      addToast({ description: "Max 3 media items allowed.", color: "danger" });
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

      if (gif) formData.append("giphy", gif);

      mediaFiles.forEach((file) => formData.append("newMedia", file));

      keepMediaIds.forEach((id) => formData.append("keepMedia", id.toString()));

      const response = await axios.put(`/api/posts/${post.id}`, formData);

      if (response.status === 200) {
        addToast({
          description: "Post updated successfully.",
          color: "success",
        });
        onPostUpdated && onPostUpdated(response.data.data);
      }

      router.push(`/user/${post.author?.username}/posts/${post.id}`);
    } catch (error: any) {
      addToast({
        description: error.response?.data?.message || "Failed to update post.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeExistingMedia = (id: number) => {
    setKeepMediaIds((prev) => prev.filter((mediaId) => mediaId !== id));
    setExistingMedia((prev) => prev.filter((media) => media.id !== id));
  };

  const removeNewMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full border-b-1 border-foreground-100">
      {user && (
        <div className="flex gap-4">
          <div>
            <Avatar src={user.imageUrl} />
          </div>
          <div className="w-full">
            <Textarea
              variant="underlined"
              placeholder="What's happening?"
              minRows={1}
              value={content}
              onChange={async (e) => {
                const value = e.target.value;
                setContent(value);
                const match = value
                  .slice(0, e.target.selectionStart ?? undefined)
                  .match(/@(\w+)$/);
                if (match) {
                  const keyword = match[1];
                  setMentionQuery(keyword);
                  setShowMentions(true);
                  try {
                    const res = await axios.get(
                      `/api/users?keyword=${keyword}`
                    );
                    let users: User[] = res.data.data;
                    if ("oxa".startsWith(keyword.toLowerCase())) {
                      users.unshift({
                        id: 1,
                        username: "oxa",
                        first_name: "OXA",
                        last_name: "AI",
                        profile_pict:
                          "https://nhdevcdn.zeth.biz.id/images/OXA.png ",
                        bio: "AI assistant from Nesahub",
                        gender: "NOT_SET",
                        created_at: new Date().toISOString(),
                      });
                    }
                    setMentionResults(users);
                  } catch (err) {
                    setMentionResults([]);
                  }
                } else {
                  setShowMentions(false);
                  setMentionResults([]);
                }
              }}
              classNames={{
                inputWrapper: "border-b-1 border-foreground-100",
              }}
              className="mb-4"
            />

            {showMentions && mentionResults.length > 0 && (
              <div className="absolute bg-background border border-foreground-100 shadow-md rounded-md mt-1 z-50 max-h-60 overflow-y-auto w-64 p-2">
                {mentionResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      const cursor = content.lastIndexOf("@" + mentionQuery);
                      const before = content.slice(0, cursor);
                      const after = content.slice(
                        cursor + mentionQuery.length + 1
                      );
                      const newContent = `${before}@${user.username} ${after}`;
                      setContent(newContent);
                      setShowMentions(false);
                    }}
                    className="p-2 w-full cursor-pointer hover:bg-foreground-50 flex items-center"
                  >
                    <HeroUIUser
                      avatarProps={{
                        src: user.profile_pict,
                      }}
                      name={`${user.first_name} ${user.last_name}`}
                      description={`@${user.username}`}
                    />
                  </button>
                ))}
              </div>
            )}

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
                  onClick={() => {
                    setGif("");
                    const existingGiphy = post.media?.find(
                      (m) => m.source === "GIPHY"
                    );
                    if (existingGiphy) {
                      setKeepMediaIds((prev) =>
                        prev.filter((id) => id !== existingGiphy.id)
                      );
                    }
                  }}
                  className="absolute top-1 right-1 bg-foreground bg-opacity-50 rounded-full p-1 hover:bg-opacity-100 transition"
                >
                  <X size={20} className="text-background" />
                </button>
                <Image
                  src="/powered-by-giphy-icon.png"
                  alt="Powered by GIPHY"
                  width={60}
                  height={32}
                  className="absolute bottom-2 left-2"
                />
              </div>
            )}

            {existingMedia.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {existingMedia
                  .filter((media) => media.source === "USERCONTENT")
                  .map((media) => (
                    <div
                      key={media.id}
                      className="relative w-24 h-24 rounded overflow-hidden"
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_FTP_BASE_URL}${media.path}`}
                        alt="preview"
                        layout="fill"
                        objectFit="cover"
                        className="rounded"
                      />
                      <button
                        className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full"
                        onClick={() => removeExistingMedia(media.id)}
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
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
                      onClick={() => removeNewMedia(idx)}
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
                <GifPopover
                  onSelected={(selectedGif) => {
                    // Always update GIF value
                    setGif(selectedGif);

                    // If there was an existing GIPHY, remove it from keep list
                    const existingGiphy = post.media?.find(
                      (m) => m.source === "GIPHY"
                    );

                    if (existingGiphy) {
                      setKeepMediaIds((prev) =>
                        prev.filter((id) => id !== existingGiphy.id)
                      );
                    }
                  }}
                />
              </div>
              <Button
                className="font-semibold"
                radius="full"
                variant="ghost"
                isDisabled={
                  !gif &&
                  mediaFiles.length === 0 &&
                  keepMediaIds.length === 0 &&
                  (content.length < 10 || content.length > 5000)
                }
                onPress={handleUpdatePost}
                isLoading={loading}
              >
                Update Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
