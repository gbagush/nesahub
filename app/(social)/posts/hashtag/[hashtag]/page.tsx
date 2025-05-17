import HashTagPage from "@/components/explore-page/hashtag-page";

export default async function UserPage({
  params,
}: {
  params: Promise<{ hashtag: string }>;
}) {
  const { hashtag } = await params;

  return <HashTagPage hashtag={hashtag} />;
}
