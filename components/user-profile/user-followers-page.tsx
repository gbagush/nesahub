"use client";
import axios from "axios";

import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { addToast } from "@heroui/toast";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Calendar, EllipsisVertical, Mail } from "lucide-react";
import { Spinner } from "@heroui/spinner";

import { PostCard } from "../commons/post/post-card";
import { Navbar } from "../commons/navigations/social/navbar";
import { NavTab } from "../commons/navigations/social/tab";

import type { User } from "@/types/user";
import { User as HeroUIUser } from "@heroui/user";
import Link from "next/link";

export const UserFollowersPage = ({
  username,
  tab = "followers",
}: {
  username: string;
  tab?: "followers" | "following";
}) => {
  const [userData, setUserData] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/users/${username}`);

      setUserData(response.data?.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch user data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      {loading && <Spinner className="py-4" />}

      {userData && (
        <>
          <Navbar
            title={`${userData.first_name} ${userData.last_name}`}
            isBordered={false}
          />
          <NavTab
            items={[
              { label: "Followers", href: `/user/${username}/followers` },
              { label: "Following", href: `/user/${username}/following` },
            ]}
            isSticky
          />
        </>
      )}

      <section className="flex flex-col items-center justify-center">
        {userData && (
          <>
            {tab === "followers" && <UserFollowers username={username} />}
            {tab === "following" && <UserFollowing username={username} />}
          </>
        )}
      </section>
    </>
  );
};

export const UserFollowers = ({ username }: { username: string }) => {
  const [followers, setFollowers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchUserFollowers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/users/${username}/followers`);

      setFollowers(response.data?.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch user followers",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFollowers();
  }, []);

  return (
    <>
      {loading && <Spinner className="py-4" />}

      {!loading && followers.length === 0 && (
        <span className="py-4">No followers found.</span>
      )}

      <div className="flex flex-col gap-4 w-full p-4">
        {!loading &&
          followers.length > 0 &&
          followers.map((follower) => (
            <Link href={`/user/${follower.username}`} key={follower.id}>
              <HeroUIUser
                avatarProps={{
                  src: follower.profile_pict,
                }}
                name={`${follower.first_name} ${follower.last_name}`}
                description={`@${follower.username}`}
              />
            </Link>
          ))}
      </div>
    </>
  );
};

export const UserFollowing = ({ username }: { username: string }) => {
  const [followers, setFollowers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchUserFollowing = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/users/${username}/following`);

      setFollowers(response.data?.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch user followers",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFollowing();
  }, []);

  return (
    <>
      {loading && <Spinner className="py-4" />}

      {!loading && followers.length === 0 && (
        <span className="py-4">No following found.</span>
      )}

      <div className="flex flex-col gap-4 w-full p-4">
        {!loading &&
          followers.length > 0 &&
          followers.map((follower) => (
            <Link href={`/user/${follower.username}`} key={follower.id}>
              <HeroUIUser
                avatarProps={{
                  src: follower.profile_pict,
                }}
                name={`${follower.first_name} ${follower.last_name}`}
                description={`@${follower.username}`}
              />
            </Link>
          ))}
      </div>
    </>
  );
};
