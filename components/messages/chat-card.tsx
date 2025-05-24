"use client";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";

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
    <Link href={`/messages/${id}`} className="flex items-center gap-2">
      <div>
        <Avatar src={profile_picture} />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex flex-wrap items-center text-sm break-words">
          <span className="font-semibold">{name}</span>
          <span className="text-foreground-500 ml-1">@{username}</span>
        </div>
        <span className="text-sm text-foreground-500 truncate w-2/3">
          {message}
        </span>
      </div>
    </Link>
  );
};
