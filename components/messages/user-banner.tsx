import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";

import Link from "next/link";

import type { Participant } from "@/types/conversation";

export const UserBanner = ({
  otherParticipant,
}: {
  otherParticipant: Participant | undefined;
}) => {
  return (
    <div className="flex flex-col items-center w-full gap-2 pb-4 border-b-1 border-foreground-100">
      <Avatar
        src={otherParticipant?.user.profile_pict}
        alt="User Avatar"
        size="lg"
      />
      <span className="flex flex-col items-center font-semibold">
        {otherParticipant?.user.first_name} {otherParticipant?.user.last_name}
        <span className="text-sm font-normal text-foreground-500">
          @{otherParticipant?.user.username}
        </span>
      </span>
      <Button
        as={Link}
        href={`/user/${otherParticipant?.user.username}`}
        size="sm"
        variant="bordered"
      >
        View profile
      </Button>
    </div>
  );
};
