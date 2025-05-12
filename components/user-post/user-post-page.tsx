"use client";
import axios from "axios";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { addToast } from "@heroui/toast";

import { ArrowLeft } from "lucide-react";
import { Button } from "@heroui/button";
import { CreatePostForm } from "../commons/create-post-form";
import { Spinner } from "@heroui/spinner";

import { PostCard } from "@/components/commons/post-card";

import type { Post } from "@/types/post";
import { SocialNav } from "../navigations/social/social-nav";

export default function UserPostPage({
  username,
  postId,
}: {
  username: String;
  postId: Number;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}`);
      setPost(response.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch replies.",
        color: "danger",
      });
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await axios.get(`/api/posts/${postId}/replies`);
      setReplies(response.data.data);
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to fetch replies.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchPost();
    fetchReplies();

    setLoading(false);
  }, []);

  return (
    <>
      <SocialNav title="Post" />

      {loading && <Spinner className="py-4" />}

      {post && (
        <section className="flex flex-col items-center justify-center gap-4">
          <>
            <PostCard post={post} />
            <CreatePostForm
              parentId={postId}
              onNewPost={(newPost) => {
                setReplies((prev) => [newPost, ...prev]);
              }}
            />
          </>

          {!loading && replies.length === 0 && <span>No replies found</span>}

          {replies.length > 0 &&
            replies.map((post) => (
              <PostCard key={post.id} post={post} isPostReply />
            ))}
        </section>
      )}
    </>
  );
}
