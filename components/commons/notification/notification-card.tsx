"use client";

import { Notification } from "@/types/notification";
import { Avatar } from "@heroui/avatar";
import { PostBox } from "../post/post-box";
import Link from "next/link";

export const NotificationCard = ({
  notification,
}: {
  notification: Notification;
}) => {
  return (
    <div className="flex gap-2 items-start w-full border-b p-4 border-foreground-100">
      <Link
        href={
          notification.initiator
            ? `/user/${notification.initiator.username}`
            : ""
        }
      >
        <Avatar src={notification.initiator?.profile_pict || "/logo.png"} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={
            notification.initiator
              ? `/user/${notification.initiator.username}`
              : ""
          }
          className="flex flex-wrap items-center text-sm break-words font-semibold"
        >
          {notification.initiator &&
            `${notification.initiator.first_name} ${notification.initiator.last_name}`}
        </Link>
        <p className="text-sm whitespace-pre-line break-words text-foreground-500">
          {notification.type === "NEW_FOLLOWER" &&
            "has started following you. Say hello!"}
          {notification.type === "POST_MENTION" &&
            "mentioned you in a post. Check it out!"}
          {notification.type === "POST_REPLY" &&
            "replied to your post. See what they said!"}
        </p>
        <p className="text-sm whitespace-pre-line break-words">
          {notification.message}
        </p>
        {notification.post && (
          <div className="mt-2">
            <PostBox post={notification.post} />
          </div>
        )}
      </div>
    </div>
  );
};
