"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { addToast } from "@heroui/toast";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@heroui/avatar";
import {
  Bookmark,
  Bot,
  Dot,
  MessagesSquare,
  Repeat2,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import type { Post } from "@/types/post";
import { MediaCard } from "./media-card";

export const PostCard = ({
  post: initialPost,
  isPostReply,
}: {
  post: Post;
  isPostReply?: boolean;
}) => {
  const [post, setPost] = useState<Post>(initialPost);

  const { author, aiBot, content, created_at, _count } = post;

  const handleAction = async (
    action: "like" | "dislike" | "repost" | "save"
  ) => {
    let isActive = false;

    switch (action) {
      case "like":
        isActive = post.is_liked || false;
        break;
      case "dislike":
        isActive = post.is_disliked || false;
        break;
      case "repost":
        isActive = post.is_reposted || false;
        break;
      case "save":
        isActive = post.is_saved || false;
        break;
    }

    try {
      if (isActive) {
        await axios.delete(`/api/posts/${post.id}/${action}`);
        setPost((prevPost) => {
          const updatedCount = { ...prevPost._count };
          switch (action) {
            case "like":
              updatedCount.liked_by = Math.max(0, updatedCount.liked_by - 1);
              return { ...prevPost, _count: updatedCount, is_liked: false };
            case "dislike":
              updatedCount.disliked_by = Math.max(
                0,
                updatedCount.disliked_by - 1
              );
              return { ...prevPost, _count: updatedCount, is_disliked: false };
            case "repost":
              updatedCount.reposted_by = Math.max(
                0,
                updatedCount.reposted_by - 1
              );
              return { ...prevPost, _count: updatedCount, is_reposted: false };
            case "save":
              updatedCount.saved_by = Math.max(0, updatedCount.saved_by - 1);
              return { ...prevPost, _count: updatedCount, is_saved: false };
            default:
              return prevPost;
          }
        });
      } else {
        await axios.post(`/api/posts/${post.id}/${action}`);
        setPost((prevPost) => {
          const updatedCount = { ...prevPost._count };
          switch (action) {
            case "like":
              updatedCount.liked_by += 1;
              if (prevPost.is_disliked) {
                updatedCount.disliked_by = Math.max(
                  0,
                  updatedCount.disliked_by - 1
                );
              }
              return {
                ...prevPost,
                _count: updatedCount,
                is_liked: true,
                is_disliked: false,
              };
            case "dislike":
              updatedCount.disliked_by += 1;
              if (prevPost.is_liked) {
                updatedCount.liked_by = Math.max(0, updatedCount.liked_by - 1);
              }
              return {
                ...prevPost,
                _count: updatedCount,
                is_disliked: true,
                is_liked: false,
              };
            case "repost":
              updatedCount.reposted_by += 1;
              return { ...prevPost, _count: updatedCount, is_reposted: true };
            case "save":
              updatedCount.saved_by += 1;
              return { ...prevPost, _count: updatedCount, is_saved: true };
            default:
              return prevPost;
          }
        });
      }
    } catch {
      addToast({
        description: `Failed to ${isActive ? "remove" : "add"} ${action} post.`,
        color: "danger",
      });
    }
  };

  const media = post.media ?? [];

  return (
    <div className="flex flex-col p-4 gap-4 w-full border-b border-foreground-100">
      <div className="flex gap-2 items-start w-full">
        {author && (
          <Link href={`/user/${author.username}`}>
            <Avatar src={author.profile_pict} />
          </Link>
        )}

        {aiBot && <Avatar src={aiBot.profile_pict} />}

        <div className="flex-1 min-w-0">
          <Link
            href={author ? `/user/${author.username}` : "#"}
            className="flex flex-wrap items-center text-sm break-words"
          >
            <span className="font-semibold">
              {author && `${author.first_name} ${author.last_name}`}
              {aiBot && `${aiBot.name}`}
            </span>
            <span className="ml-1 text-foreground-500">
              @{author && author.username}
              {aiBot && aiBot.username}
            </span>
            <Dot className="text-foreground-500" size={20} />
            <span className="ml-1 text-foreground-500">
              {formatDistanceToNow(new Date(created_at))}
            </span>
          </Link>

          {!isPostReply && post.parent?.author && (
            <p className="text-sm text-foreground-500">
              Reply{" "}
              <Link
                href={`/user/${post.parent.author.username}/posts/${post.parent.id}`}
                className="text-primary"
              >
                @{post.parent.author.username}
              </Link>
            </p>
          )}

          <p className="text-sm whitespace-pre-line break-words">
            {parseContent(content)}
          </p>

          {media.length > 0 && (
            <div
              className={`py-2 grid gap-2 ${
                media.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {media.map((m, i) => (
                <MediaCard
                  key={i}
                  path={m.path}
                  source={m.source}
                  alt={`Post media ${i + 1}`}
                  span={media.length === 3 && i === 0}
                />
              ))}
            </div>
          )}

          {aiBot && (
            <p className="flex items-center gap-1 text-xs text-foreground-500 mt-1">
              <Bot size={20} /> AI Generated, always check the facts.
            </p>
          )}

          <div className="flex justify-between mt-4">
            {author && (
              <Link
                href={`/user/${author.username}/posts/${post.id}`}
                className="flex items-center gap-1 text-foreground-500 hover:text-primary"
              >
                <MessagesSquare size={16} />
                <span className="text-xs">
                  {Intl.NumberFormat().format(_count.replies)}
                </span>
              </Link>
            )}

            <button
              className={`flex items-center gap-1 ${post.is_liked ? "text-red-500" : "text-foreground-500 hover:text-red-500"}`}
              onClick={() => handleAction("like")}
            >
              <ThumbsUp size={16} />
              <span className="text-xs">
                {Intl.NumberFormat().format(_count.liked_by)}
              </span>
            </button>
            <button
              className={`flex items-center gap-1 ${post.is_disliked ? "text-red-500" : "text-foreground-500 hover:text-red-500"}`}
              onClick={() => handleAction("dislike")}
            >
              <ThumbsDown size={16} />
              <span className="text-xs">
                {Intl.NumberFormat().format(_count.disliked_by)}
              </span>
            </button>
            <button
              className={`flex items-center gap-1 ${post.is_reposted ? "text-emerald-500" : "text-foreground-500 hover:text-emerald-500"}`}
              onClick={() => handleAction("repost")}
            >
              <Repeat2 size={16} />
              <span className="text-xs">
                {Intl.NumberFormat().format(_count.reposted_by)}
              </span>
            </button>
            <button
              className={`flex items-center gap-1 ${post.is_saved ? "text-primary" : "text-foreground-500 hover:text-primary"}`}
              onClick={() => handleAction("save")}
            >
              <Bookmark size={16} />
              <span className="text-xs">
                {Intl.NumberFormat().format(_count.saved_by)}
              </span>
            </button>

            {author && (
              <button
                className="text-foreground-500 hover:text-foreground"
                onClick={() =>
                  navigator.share?.({
                    title: "Nesahub",
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/user/${author.username}/posts/${post.id}`,
                  })
                }
              >
                <Share size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const parseContent = (text: string) => {
  return text.split(/(\s+)/).map((word, index) => {
    const hashtagMatch = word.match(/^#(\w+)$/);
    if (hashtagMatch) {
      const hashtag = hashtagMatch[1];
      return (
        <span key={index} className="inline">
          <Link
            href={`/posts/hashtag/${hashtag}`}
            className="text-primary hover:underline"
          >
            #{hashtag}
          </Link>
        </span>
      );
    }

    const mentionMatch = word.match(/^@(\w+)$/);
    if (mentionMatch) {
      const username = mentionMatch[1];
      return (
        <span key={index} className="inline">
          <Link
            href={`/user/${username}`}
            className="text-primary hover:underline"
          >
            @{username}
          </Link>
        </span>
      );
    }

    const urlMatch = word.match(/^https?:\/\/[^\s]+$/);
    if (urlMatch) {
      return (
        <span key={index} className="inline">
          <a
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {word}
          </a>
        </span>
      );
    }

    return <span key={index}>{word}</span>;
  });
};
