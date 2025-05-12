import axios from "axios";

import UserPostPage from "@/components/user-post/user-post-page";

import { PostNotFound } from "@/components/user-post/post-not-found";

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: String; postId: Number }>;
}) {
  const { username, postId } = await params;

  const numericPostId = Number(postId);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${numericPostId}`
    );

    const post = response.data?.data;

    if (!post) return <PostNotFound />;

    if (post.author.username !== username) return <PostNotFound />;

    return <UserPostPage username={username} postId={numericPostId} />;
  } catch (error) {
    return <PostNotFound />;
  }
}
