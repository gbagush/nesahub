"use client";
import axios from "axios";

import { format } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { addToast } from "@heroui/toast";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Calendar, EllipsisVertical, Mail } from "lucide-react";
import { Spinner } from "@heroui/spinner";

import { PostCard } from "../commons/post/post-card";
import { Navbar } from "../commons/navigations/social/navbar";

import type { User } from "@/types/user";
import type { Post } from "@/types/post";
import { NavTab } from "../commons/navigations/social/tab";
import Link from "next/link";
import { NotFoundSection } from "../commons/navigations/social/not-found-section";
import { EditProfileModal } from "./edit-profile-modal";

const LIMIT = 10;

export const UserProfilePage = ({
  username,
  tab = "posts",
}: {
  username: string;
  tab?: "posts" | "reposts";
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
        <Navbar title={`${userData.first_name} ${userData.last_name}`} />
      )}

      <section className="flex flex-col items-center justify-center">
        {userData && (
          <>
            <UserProfileHeader userData={userData} />
            {tab === "posts" && <UserPosts userData={userData} />}
            {tab === "reposts" && <UserReposts userData={userData} />}
          </>
        )}
      </section>
    </>
  );
};

export const UserProfileHeader = ({
  userData: initialUserData,
}: {
  userData: User;
}) => {
  const [userData, setUserData] = useState<User>(initialUserData);

  const { isSignedIn, user } = useUser();

  const handleFollow = async () => {
    if (!isSignedIn) return;

    try {
      if (userData.is_followed) {
        await axios.delete(`/api/users/${userData.username}/follow`);
        setUserData((prev) => ({
          ...prev,
          is_followed: false,
          _count: {
            ...prev._count!,
            followers: prev._count!.followers - 1,
          },
        }));
      } else {
        await axios.post(`/api/users/${userData.username}/follow`);
        setUserData((prev) => ({
          ...prev,
          is_followed: true,
          _count: {
            ...prev._count!,
            followers: prev._count!.followers + 1,
          },
        }));
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: `Failed to ${userData.is_followed ? "unfollow" : "follow"} the user.`,
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col w-full justify-start border-b border-foreground-200">
      <div className="p-4">
        <Avatar
          src={userData.profile_pict}
          className="h-20 w-20 mb-2"
          isBordered
        />
        <div className="flex w-full justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {`${userData.first_name} ${userData.last_name}`}{" "}
              <span className="font-normal text-sm text-foreground-500">
                {userData.gender === "MALE"
                  ? "He/Him"
                  : userData.gender === "FEMALE"
                    ? "She/Her"
                    : ""}
              </span>
            </h2>
            <span className="text-foreground-500">@{userData.username}</span>
          </div>

          {isSignedIn && user.username !== userData.username ? (
            <div className="flex gap-2 items-center">
              <Button variant="ghost" radius="full" isIconOnly>
                <EllipsisVertical size={16} />
              </Button>

              <Button variant="ghost" radius="full" isIconOnly>
                <Mail size={16} />
              </Button>

              <Button variant="ghost" radius="full" onPress={handleFollow}>
                {userData.is_followed ? "Unfollow" : "Follow"}
              </Button>
            </div>
          ) : (
            <EditProfileModal user={userData} />
          )}
        </div>
        {userData.bio && (
          <p className="mt-4 text-sm whitespace-pre-line break-words">
            {userData.bio}
          </p>
        )}
        <span className="flex gap-2 items-center text-sm text-foreground-500 mt-4">
          <Calendar size={16} /> Joinned{" "}
          {format(new Date(userData.created_at), "MMMM yyyy")}
        </span>
        <div className="flex gap-4 items-center mt-2">
          <Link
            href={`/user/${userData.username}/followers`}
            className="text-foreground-500 hover:underline cursor-pointer"
          >
            <span className="text-foreground font-semibold mr-1">
              {userData._count?.followers}
            </span>{" "}
            Followers
          </Link>

          <Link
            href={`/user/${userData.username}/following`}
            className="text-foreground-500 hover:underline cursor-pointer"
          >
            <span className="text-foreground font-semibold mr-1">
              {userData._count?.following}
            </span>{" "}
            Following
          </Link>
        </div>
      </div>

      <NavTab
        items={[
          { label: "Posts", href: `/user/${userData.username}` },
          { label: "Reposts", href: `/user/${userData.username}/reposts` },
        ]}
      />
    </div>
  );
};

export const UserPosts = ({ userData }: { userData: User }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const { ref, inView } = useInView();

  const fetchPosts = async (currentPage: number) => {
    try {
      const response = await axios.get(
        `/api/users/${userData.username}/posts?page=${currentPage}&limit=${LIMIT}`
      );
      const newPosts: Post[] = response.data?.data || [];

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });

      if (newPosts.length < LIMIT) setHasMore(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch user posts",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [userData.username]);

  useEffect(() => {
    if (hasMore) fetchPosts(page);
  }, [page]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {!loading && posts.length === 0 && (
        <NotFoundSection
          page="User Posts"
          title="No Posts Yet"
          description="This user hasn't posted anything yet."
          hideNavbar
        />
      )}

      {loading && <Spinner className="py-4" />}

      <div ref={ref} className="h-8" />
    </>
  );
};

export const UserReposts = ({ userData }: { userData: User }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const { ref, inView } = useInView();

  const fetchReposts = async (currentPage: number) => {
    try {
      const response = await axios.get(
        `/api/users/${userData.username}/reposts?page=${currentPage}&limit=${LIMIT}`
      );
      const newPosts: Post[] = response.data?.data || [];

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });

      if (newPosts.length < LIMIT) setHasMore(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch user reposts",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [userData.username]);

  useEffect(() => {
    if (hasMore) {
      setLoading(true);
      fetchReposts(page);
    }
  }, [page]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {!loading && posts.length === 0 && (
        <NotFoundSection
          page="User Reposts"
          title="No Reposts Yet"
          description="This user hasn't reposted anything yet."
          hideNavbar
        />
      )}

      {loading && <Spinner className="py-4" />}

      <div ref={ref} className="h-8" />
    </>
  );
};
