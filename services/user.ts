import { db } from "@/lib/db";

export const getUserByUsername = async ({ username }: { username: string }) => {
  return await db.user.findUnique({
    where: {
      username: username,
    },
  });
};
export const getUserByIdForFollowing = async ({ id }: { id: string }) => {
  return await db.user.findUnique({
    where: { id: Number(id) },
    select: {
      following: {
        select: { id: true },
      },
    },
  });
};


export const getUsers = async({
  where,
  limit,
  skip,
}: {
  where: any;
  limit?: number;
  skip?: number;
}) => {
  return await db.user.findMany({
    where: where,
    take: limit,
    skip,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      username: true,
      profile_pict: true,
      created_at: true,

      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}
