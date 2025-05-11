import { formatDistanceToNow } from "date-fns";

import { Bookmark, MessagesSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@heroui/button";
import { User } from "@heroui/user";

import type { Post } from "@/types/post";
import Link from "next/link";

export const PostCard = ({ post }: { post: Post }) => {
  const { author, content, created_at, _count } = post;

  return (
    <div className="flex flex-col p-4 items-start gap-4 w-full border-b-1 border-foreground-100">
      <Link href={`/${author.username}`}>
        <User
          avatarProps={{
            src: author.profile_pict,
          }}
          name={`${author.first_name} ${author.last_name}`}
          description={formatDistanceToNow(new Date(created_at), {
            addSuffix: true,
          })}
        />
      </Link>

      <Link href={`/${author.username}/post/${post.id}`}>
        <p className="text-base whitespace-pre-line">{content}</p>
      </Link>

      <div className="flex justify-between w-full">
        <div className="flex flex-wrap gap-4 w-full">
          <Button variant="light" radius="full">
            <ThumbsUp size={16} />
            {Intl.NumberFormat().format(_count.liked_by)}
          </Button>
          <Button variant="light" radius="full">
            <ThumbsDown size={16} />
            {Intl.NumberFormat().format(_count.disliked_by)}
          </Button>
          <Button variant="light" radius="full">
            <MessagesSquare size={16} />
            {Intl.NumberFormat().format(_count.reposted_by)}
          </Button>
          <Button variant="light" radius="full">
            <Bookmark size={16} />
            {Intl.NumberFormat().format(_count.saved_by)}
          </Button>
        </div>
      </div>
    </div>
  );
};
