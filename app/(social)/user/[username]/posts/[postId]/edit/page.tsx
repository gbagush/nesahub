import { getPost } from "@/services/post";
import { notFound, redirect } from "next/navigation";
import { EditPostForm } from "@/components/commons/post/edit-post-form";
import { getServerUser } from "@/lib/auth";
import { Navbar } from "@/components/commons/navigations/social/navbar";
import { serializePost } from "@/lib/utils";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) {
  const resolvedParams = await params;
  const { username, postId } = resolvedParams;

  const numericPostId = parseInt(postId, 10);
  if (isNaN(numericPostId)) {
    notFound();
  }

  const user = await getServerUser();
  if (!user) {
    redirect("/sign-in");
  }

  const post = await getPost({ id: numericPostId });

  if (
    !post ||
    post.author?.username !== username ||
    post.author?.id !== user.id
  ) {
    notFound();
  }

  const serializedPost = serializePost(post);

  return (
    <>
      <Navbar title="Edit post" />
      <EditPostForm post={serializedPost} />
    </>
  );
}
