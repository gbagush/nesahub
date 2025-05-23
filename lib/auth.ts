import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getServerUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerk_id: userId },
  });

  return user;
}
