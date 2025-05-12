"use client";
import axios from "axios";
import Link from "next/link";

import { formatDistanceToNow } from "date-fns";

import { Avatar } from "@heroui/avatar";
import {
  Bookmark,
  Dot,
  MessagesSquare,
  Repeat2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import type { Post } from "@/types/post";
import { useState } from "react";
import { addToast } from "@heroui/toast";

export const PostCard = ({
  post: initialPost,
  isPostReply,
}: {
  post: Post;
  isPostReply?: boolean;
}) => {
  const [post, setPost] = useState<Post>(initialPost);

  const { author, content, created_at, _count } = post;

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
              return {
                ...prevPost,
                _count: updatedCount,
                is_liked: false,
              };
            case "dislike":
              updatedCount.disliked_by = Math.max(
                0,
                updatedCount.disliked_by - 1
              );
              return {
                ...prevPost,
                _count: updatedCount,
                is_disliked: false,
              };
            case "repost":
              updatedCount.reposted_by = Math.max(
                0,
                updatedCount.reposted_by - 1
              );
              return {
                ...prevPost,
                _count: updatedCount,
                is_reposted: false,
              };
            case "save":
              updatedCount.saved_by = Math.max(0, updatedCount.saved_by - 1);
              return {
                ...prevPost,
                _count: updatedCount,
                is_saved: false,
              };
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

              return {
                ...prevPost,
                _count: updatedCount,
                is_reposted: true,
              };
            case "save":
              updatedCount.saved_by += 1;

              return {
                ...prevPost,
                _count: updatedCount,
                is_saved: true,
              };
            default:
              return prevPost;
          }
        });
      }
    } catch (error) {
      addToast({
        description: `Failed to ${isActive ? "remove" : "add"} ${action} post.`,
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4 w-full border-b border-foreground-100">
      <div className="flex gap-2 items-start w-full">
        <Link href={`/user/${author.username}`}>
          <Avatar src={author.profile_pict} />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/user/${author.username}`}
            className="flex items-center text-sm break-words"
          >
            <span className="font-semibold">{`${author.first_name} ${author.last_name}`}</span>
            <span className="ml-1 text-foreground-500">@{author.username}</span>
            <Dot className="text-foreground-500" size={20} />
            <span className="ml-1 text-foreground-500">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </Link>

          {!isPostReply && post.parent && (
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

          <p className="text-sm whitespace-pre-line break-words">{content}</p>

          <div className="flex justify-between w-3/4 mt-4">
            <Link
              href={`/user/${author.username}/posts/${post.id}`}
              className="flex items-center gap-1 text-foreground-500 hover:text-primary"
            >
              <MessagesSquare size={16} />
              <span className="text-xs">
                {Intl.NumberFormat().format(_count.replies)}
              </span>
            </Link>
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
          </div>
        </div>
      </div>
    </div>
  );
};
