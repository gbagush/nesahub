"use client";
import axios from "axios";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";

import { CreatePostForm } from "@/components/commons/create-post-form";
import { Navbar } from "@/components/navigations/social/navbar";
import { PostCard } from "@/components/commons/post-card";

import type { Post } from "@/types/post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { isSignedIn } = useUser();

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts");
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
      <Navbar />

      <section className="flex flex-col items-center justify-center gap-4">
        {isSignedIn && (
          <CreatePostForm
            onNewPost={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
            }}
          />
        )}

        {loading && (
          <div className="flex w-full h-24 items-center justify-center">
            <Spinner />
          </div>
        )}

        {posts.length === 0 && !loading && (
          <p className="text-center text-gray-500">No posts found.</p>
        )}

        {posts.length > 0 &&
          posts.map((post) => <PostCard key={post.id} post={post} />)}
      </section>
    </>
  );
}
