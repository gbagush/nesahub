"use client";
import Link from "next/link";
import { Avatar } from "@heroui/avatar";

export const ChatCard = ({
  id,
  name,
  username,
  profile_picture,
  message,
}: {
  id: number;
  name: string;
  username: string;
  profile_picture: string;
  message: string;
}) => {
  return (
    <Link href={`/messages/${id}`} className="flex items-center gap-2 w-full">
      <div>
        <Avatar src={profile_picture} />
      </div>
      <div className="flex flex-col min-w-0 w-full">
        <div className="flex flex-wrap items-center text-sm break-words">
          <span className="font-semibold">{name}</span>
          <span className="text-foreground-500 ml-1">@{username}</span>
        </div>
        <span className="text-sm text-foreground-500 truncate">{message}</span>
      </div>
    </Link>
  );
};
