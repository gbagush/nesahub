"use client";
import axios from "axios";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { addToast } from "@heroui/toast";
import { PostCard } from "@/components/commons/post/post-card";
import { Spinner } from "@heroui/spinner";

import { SearchNav } from "@/components/commons/navigations/social/search-nav";
import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";

import type { Post } from "@/types/post";

const LIMIT = 10;

export default function HashTagPage({ hashtag }: { hashtag: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  const getPosts = async (currentPage = 1) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/posts/hashtag/${hashtag}?page=${currentPage}&limit=${LIMIT}`
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
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      getPosts(page);
    }
  }, [page]);

  useEffect(() => {
    getPosts(1);
  }, [hashtag]);

  return (
    <>
      <SearchNav query={`#${hashtag}`} />
      <section className="flex flex-col items-center justify-center gap-4">
        {posts.length > 0 &&
          posts.map((post) => <PostCard key={post.id} post={post} />)}

        {loading && <Spinner className="py-2" />}

        {!loading && posts.length === 0 && (
          <NotFoundSection
            page="Hashtag"
            title={`No posts found for #${hashtag}`}
            description="Try searching for a different hashtag or explore popular tags."
            hideNavbar
          />
        )}

        {!loading && hasMore && <div ref={ref} className="h-10 w-full" />}
      </section>
    </>
  );
}
