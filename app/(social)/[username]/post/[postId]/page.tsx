import UserPostPage from "@/components/user-post/user-post-page";
import axios from "axios";

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

    if (!post) return <h1>Not Found</h1>;

    return (
      <UserPostPage post={post} username={username} postId={numericPostId} />
    );
  } catch (error) {
    console.error("Error: Error while access post page: ", error);
    return <h1>Error</h1>;
  }
}
