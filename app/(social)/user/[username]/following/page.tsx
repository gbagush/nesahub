import axios from "axios";

import { UserFollowersPage } from "@/components/user-profile/user-followers-page";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  try {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users/${username}`
    );

    return <UserFollowersPage username={username} tab="following" />;
  } catch (error) {
    return <h1>User not found</h1>;
  }
}
