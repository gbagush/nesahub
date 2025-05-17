"use client";
import axios from "axios";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";

import { addToast } from "@heroui/toast";
import { PostCard } from "@/components/commons/post/post-card";
import { User as HeroUIUser } from "@heroui/user";
import { Spinner } from "@heroui/spinner";

import { SearchNav } from "@/components/commons/navigations/social/search-nav";
import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";

import type { Post } from "@/types/post";
import type { User } from "@/types/user";
import { UserCard } from "@/components/commons/users/user-card";

const LIMIT = 10;

export default function SearchPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { ref, inView } = useInView();

  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const getPosts = async (currentPage = 1) => {
    if (!query || loadingMore) return;

    try {
      setLoadingMore(true);

      const response = await axios.get(
        `/api/posts?page=${currentPage}&limit=${LIMIT}&keyword=${query}`
      );
      const newPosts = response.data.data;

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p: Post) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });

      if (newPosts.length < LIMIT) setHasMore(false);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch posts.",
        color: "danger",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const getUsers = async () => {
    if (!query) return;

    try {
      const res = await axios.get(`/api/users?keyword=${query}`);
      setUsers(res.data.data || []);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch users.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getPosts(1), getUsers()]);
      setLoading(false);
      setPage(1);
      setHasMore(true);
    };

    fetchData();
  }, [query]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loadingMore]);

  useEffect(() => {
    if (page > 1) {
      getPosts(page);
    }
  }, [page]);

  useEffect(() => {
    setPosts([]);
    setUsers([]);
  }, [query]);

  return (
    <>
      <SearchNav
        query={query || ""}
        className="p-4 border-y border-foreground-100"
      />
      {!query && (
        <NotFoundSection
          page="Search"
          title="Start your search"
          description="Type something in the search bar to find what you're looking for."
          hideNavbar
        />
      )}
      <section className="flex flex-col items-center justify-center gap-4">
        {users.length > 0 && (
          <div className="flex flex-col w-full p-4 gap-2 items-start border-b border-foreground-100">
            <h2 className="text-xl font-semibold mb-2">People</h2>

            {users.map((user) => (
              <UserCard user={user} key={user.id} />
            ))}
          </div>
        )}

        {posts.length > 0 &&
          posts.map((post) => <PostCard key={post.id} post={post} />)}

        {loading && <Spinner className="py-2" />}

        {!loading && query && posts.length === 0 && users.length === 0 && (
          <NotFoundSection
            page="Search"
            title="No results for this search"
            description="Try adjusting your keywords or explore trending topics and profiles."
            hideNavbar
          />
        )}

        {!loading && hasMore && <div ref={ref} className="h-10 w-full" />}
      </section>
    </>
  );
}
