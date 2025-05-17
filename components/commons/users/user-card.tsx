"use client";
import axios from "axios";
import { useState } from "react";

import Link from "next/link";

import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { User as HeroUIUser } from "@heroui/user";

import type { User } from "@/types/user";

export const UserCard = ({ user: intitalUser }: { user: User }) => {
  const [user, setUser] = useState<User>(intitalUser);

  const handleFollowButtonPressed = async () => {
    try {
      if (user.is_followed) {
        await axios.delete(`/api/users/${user.username}/follow`);
      } else {
        await axios.post(`/api/users/${user.username}/follow`);
      }

      setUser((prev) => ({ ...prev, is_followed: !prev.is_followed }));
    } catch (error) {
      addToast({
        title: "Error",
        description: "Something went wrong while following the user.",
        color: "danger",
      });
    }
  };

  return (
    <div className="flex items-center w-full justify-between">
      <Link href={`/user/${user.username}`}>
        <HeroUIUser
          avatarProps={{
            src: user.profile_pict,
          }}
          name={`${user.first_name} ${user.last_name}`}
          description={`@${user.username}`}
        />
      </Link>

      <Button
        variant="bordered"
        size="sm"
        radius="full"
        onPress={handleFollowButtonPressed}
      >
        {user.is_followed ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
};
