"use client";
import axios from "axios";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";

import type { Post } from "@/types/post";

export const CreatePostForm = ({
  parentId,
  onNewPost,
}: {
  parentId?: Number;
  onNewPost: (newPost: Post) => void;
}) => {
  const [content, setContent] = useState("");

  const { user } = useUser();

  const handleCreatePost = async () => {
    if (content.length < 15 || content.length > 5000) {
      addToast({
        title: "Error",
        description: "Post must be between 15 and 5000 characters.",
        color: "danger",
      });
      return;
    }

    try {
      const response = await axios.post("/api/posts", {
        parent_id: parentId,
        content,
      });

      if (response.status === 201) {
        addToast({
          title: "Success",
          description: "Post created successfully.",
          color: "success",
        });
        setContent("");
      }

      onNewPost(response.data.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create post.";

      addToast({
        title: "Error",
        description: message,
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full border-b-1 border-foreground-100">
      {user && (
        <>
          <div className="flex gap-4">
            <div>
              <Avatar src={user.imageUrl} />
            </div>
            <Textarea
              variant="underlined"
              placeholder={parentId ? "Post your reply" : "What's happening?"}
              minRows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              classNames={{
                inputWrapper: "border-b-1 border-foreground-100",
              }}
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="font-semibold"
              radius="full"
              isDisabled={content.length < 15 || content.length > 5000}
              onPress={handleCreatePost}
            >
              Post
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
