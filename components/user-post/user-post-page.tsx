"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

import { CreatePostForm } from "../commons/post/create-post-form";
import { PostCard } from "@/components/commons/post/post-card";
import { Navbar } from "../commons/navigations/social/navbar";

import type { Post } from "@/types/post";

const LIMIT = 10;

export default function UserPostPage({
  username,
  postId,
}: {
  username: String;
  postId: Number;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}`);
      setPost(response.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch post.",
        color: "danger",
      });
    }
  };

  const fetchReplies = async (currentPage = 1) => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get(
        `/api/posts/${postId}/replies?page=${currentPage}&limit=${LIMIT}`
      );

      const newReplies = response.data.data;

      setReplies((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const filtered = newReplies.filter((r: Post) => !existingIds.has(r.id));
        return [...prev, ...filtered];
      });

      if (newReplies.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch replies.",
        color: "danger",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchReplies(1);
  }, []);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchReplies(page);
    }
  }, [page]);

  return (
    <>
      <Navbar title="Post" />

      {loading && page === 1 && <Spinner className="py-4" />}

      {post && (
        <section className="flex flex-col items-center justify-center">
          <PostCard post={post} />

          <CreatePostForm
            parentId={postId}
            onNewPost={(newPost) => {
              setReplies((prev) => [newPost, ...prev]);
            }}
          />

          {replies.length === 0 && !loading && (
            <span className="text-foreground-500">No replies found</span>
          )}

          {replies.map((reply) => (
            <PostCard key={reply.id} post={reply} isPostReply />
          ))}

          {loadingMore && (
            <div className="flex w-full h-24 items-center justify-center">
              <Spinner />
            </div>
          )}

          {!loadingMore && hasMore && <div ref={ref} className="h-10 w-full" />}
        </section>
      )}
    </>
  );
}
