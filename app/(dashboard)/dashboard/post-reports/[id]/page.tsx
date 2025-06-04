import { PostReportsClient } from "./post-reports-client";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PostReportsClient id={id} />;
}
