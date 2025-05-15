"use client";
import axios from "axios";

import { useState, useEffect } from "react";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

import { PostCard } from "@/components/commons/post/post-card";
import { Navbar } from "@/components/commons/navigations/social/navbar";

import type { Post } from "@/types/post";
import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";

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
      <Navbar title="Saved posts" />

      {loading && (
        <div className="flex w-full h-24 items-center justify-center">
          <Spinner />
        </div>
      )}

      {posts.length === 0 && !loading && (
        <NotFoundSection
          page="User Reposts"
          title="No Reposts Yet"
          description="This user hasn't reposted anything yet."
          hideNavbar
        />
      )}

      {posts.length > 0 &&
        posts.map((post) => <PostCard key={post.id} post={post} />)}
    </>
  );
}
