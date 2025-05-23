"use client";
import axios from "axios";

import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

import { CreatePostForm } from "@/components/commons/post/create-post-form";
import { NavTab } from "@/components/commons/navigations/social/tab";
import { PostCard } from "@/components/commons/post/post-card";

import type { Post } from "@/types/post";
import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";

const LIMIT = 10;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();
  const { isSignedIn } = useUser();

  const fetchPosts = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/posts?page=${currentPage}&limit=${LIMIT}&following=true`
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  return (
    <>
      <NavTab
        items={[
          { label: "For you", href: "/home" },
          { label: "Following", href: "/home/following" },
        ]}
        isSticky
      />

      <section className="flex flex-col items-center justify-center">
        {isSignedIn && (
          <CreatePostForm
            onNewPost={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
            }}
          />
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading && (
          <div className="flex w-full h-24 items-center justify-center">
            <Spinner />
          </div>
        )}

        {!loading && hasMore && <div ref={ref} className="h-10 w-full" />}

        {!hasMore && !loading && posts.length > 0 && (
          <p className="text-foreground-500 text-sm text-center my-4">
            You&apos;ve reached the end.
          </p>
        )}

        {posts.length === 0 && !loading && (
          <NotFoundSection
            page="Following posts"
            title="It's quiet here"
            description="No posts from your follows yet, follow more to see posts here."
            hideNavbar
          />
        )}
      </section>
    </>
  );
}
