"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@heroui/avatar";
import type { Post } from "@/types/post";

export const PostBox = ({ post }: { post: Post }) => {
  const { author, aiBot, content, created_at } = post;

  return (
    <Link
      href={
        post.author
          ? `/user/${post.author?.username}/posts/${post.id}`
          : post.aiBot
            ? `/bot/${post.aiBot.username}/posts/${post.id}`
            : ""
      }
    >
      <div className="p-2 w-full border rounded-lg border-foreground-100">
        <div className="flex gap-2 items-start">
          {author ? (
            <Avatar src={author.profile_pict} />
          ) : aiBot ? (
            <Avatar src={aiBot.profile_pict} />
          ) : null}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center text-sm break-words">
                <span className="font-semibold">
                  {author && `${author.first_name} ${author.last_name}`}
                  {aiBot && aiBot.name}
                </span>
                <span className="ml-1 text-foreground-500">
                  @{author?.username || aiBot?.username}
                </span>
                <span className="mx-1 text-foreground-500">·</span>
                <span className="text-foreground-500">
                  {formatDistanceToNow(new Date(created_at))} ago
                </span>
              </div>
            </div>

            <div className="text-sm whitespace-pre-line break-words">
              {content.length > 250 ? content.slice(0, 250) + "..." : content}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
