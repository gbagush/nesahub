"use client";
import axios from "axios";

import { useState, useEffect } from "react";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

import { PostCard } from "@/components/commons/post-card";
import { SocialNav } from "@/components/navigations/social/social-nav";

import type { Post } from "@/types/post";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts/saved");
      setPosts(response.data.data);
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
    fetchPosts();
  }, []);

  return (
    <>
      <SocialNav title="Saved posts" />

      {loading && (
        <div className="flex w-full h-24 items-center justify-center">
          <Spinner />
        </div>
      )}

      {posts.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-4">No posts found.</p>
      )}

      {posts.length > 0 &&
        posts.map((post) => <PostCard key={post.id} post={post} />)}
    </>
  );
}
