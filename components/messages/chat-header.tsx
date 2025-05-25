"use client";

import { Participant } from "@/types/conversation";
import { Avatar } from "@heroui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ChatHeader = ({
  otherParticipant,
}: {
  otherParticipant: Participant | undefined;
}) => {
  const router = useRouter();
  return (
    <div className="sticky top-0 border-b border-foreground-100 px-4 py-2 z-50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <Link
          href={`/user/${otherParticipant?.user.username}`}
          className="flex gap-2 items-center"
        >
          <Avatar src={otherParticipant?.user.profile_pict} alt="User Avatar" />
          <span className="font-semibold">
            {otherParticipant?.user.first_name}{" "}
            {otherParticipant?.user.last_name}
          </span>
        </Link>
      </div>
    </div>
  );
};
