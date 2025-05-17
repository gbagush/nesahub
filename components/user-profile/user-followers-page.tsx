"use client";
import axios from "axios";

import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

import { addToast } from "@heroui/toast";

import { Spinner } from "@heroui/spinner";

import { Navbar } from "../commons/navigations/social/navbar";
import { NavTab } from "../commons/navigations/social/tab";
import { NotFoundSection } from "../commons/navigations/social/not-found-section";
import { UserCard } from "../commons/users/user-card";

import type { User } from "@/types/user";

const LIMIT = 10;

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
            {tab === "followers" && (
              <UserList username={username} listType="followers" />
            )}
            {tab === "following" && (
              <UserList username={username} listType="following" />
            )}
          </>
        )}
      </section>
    </>
  );
};

export const UserList = ({
  username,
  listType,
}: {
  username: string;
  listType: "followers" | "following";
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [ref, inView] = useInView();

  const fetchUsers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const endpoint =
        listType === "followers"
          ? `/api/users/${username}/followers`
          : `/api/users/${username}/following`;

      const response = await axios.get(
        `${endpoint}?page=${currentPage}&limit=${LIMIT}`
      );
      const newData = response.data?.data || [];

      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const filtered = newData.filter((u: User) => !existingIds.has(u.id));
        return [...prev, ...filtered];
      });

      if (newData.length < LIMIT) setHasMore(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: `Failed to fetch user ${listType}`,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const emptyState = {
    title:
      listType === "followers" ? "No Followers Yet" : "Not Following Anyone",
    description:
      listType === "followers"
        ? "This user hasn't gained any followers yet."
        : "This user isn't following anyone yet.",
  };

  return (
    <>
      {!loading && users.length === 0 && (
        <NotFoundSection
          page={`User ${listType.charAt(0).toUpperCase() + listType.slice(1)}`}
          title={emptyState.title}
          description={emptyState.description}
          hideNavbar
        />
      )}

      <div className="flex flex-col gap-4 w-full p-4">
        {users.map((user) => (
          <UserCard user={user} key={user.id} />
        ))}
      </div>

      {loading && (
        <div className="flex w-full h-24 items-center justify-center">
          <Spinner />
        </div>
      )}

      {!loading && hasMore && <div ref={ref} className="h-10 w-full" />}
    </>
  );
};
