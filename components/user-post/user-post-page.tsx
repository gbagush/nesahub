"use client";
import axios from "axios";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { addToast } from "@heroui/toast";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@heroui/spinner";
import { Link } from "@heroui/link";

import { PostCard } from "@/components/commons/post-card";

import type { Post } from "@/types/post";
import { CreatePostForm } from "../commons/create-post-form";
import { Button } from "@heroui/button";

export default function UserPostPage({
  post,
  username,
  postId,
}: {
  post: Post;
  username: String;
  postId: Number;
}) {
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/posts/${postId}/replies`);
      setReplies(response.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch replies.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center p-4 h-16 backdrop-blur-md border-y border-foreground-100">
        <button
          className="flex items-center gap-2 text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <section className="flex flex-col items-center justify-center gap-4">
        <PostCard post={post} />
        <CreatePostForm
          parentId={postId}
          onNewPost={(newPost) => {
            setReplies((prev) => [newPost, ...prev]);
          }}
        />

        {loading && <Spinner />}

        {!loading && replies.length === 0 && <span>No replies found</span>}

        {replies.length > 0 &&
          replies.map((post) => <PostCard key={post.id} post={post} />)}
      </section>
    </>
  );
}
