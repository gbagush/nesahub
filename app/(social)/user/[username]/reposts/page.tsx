import axios from "axios";

import { UserProfilePage } from "@/components/user-profile/user-profile-page";

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

    return <UserProfilePage username={username} tab="reposts" />;
  } catch (error) {
    return <h1>User not found</h1>;
  }
}
