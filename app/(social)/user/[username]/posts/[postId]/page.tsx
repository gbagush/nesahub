import axios from "axios";

import UserPostPage from "@/components/user-post/user-post-page";

import { NotFoundSection } from "@/components/commons/navigations/social/not-found-section";
import { db } from "@/lib/db";
import { getPost } from "@/services/post";

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: String; postId: Number }>;
}) {
  const { username, postId } = await params;

  const numericPostId = Number(postId);

  try {
    const post = await getPost({ id: numericPostId });

    if (!post || post.author.username !== username)
      return (
        <NotFoundSection
          page="Post"
          title="Post not found"
          description="The post you are looking for does not exist or is not authored by this user."
        />
      );

    return <UserPostPage username={username} postId={numericPostId} />;
  } catch (error) {
    return (
      <NotFoundSection
        page="Post"
        title="Error getting post data"
        description="An error occurred while trying to get the post data."
      />
    );
  }
}
