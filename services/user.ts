import { db } from "@/lib/db";

export const getUserByClerkId = async ({ clerk_id }: { clerk_id: string }) => {
  return await db.user.findUnique({
    where: {
      clerk_id: clerk_id,
    },
  });
};

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

export const getUsers = async ({
  where,
  limit,
  skip,
  userId,
}: {
  where: any;
  limit?: number;
  skip?: number;
  userId?: number;
}) => {
  const users = await db.user.findMany({
    where: where,
    take: limit,
    skip,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      username: true,
      profile_pict: true,
      bio: true,
      gender: true,
      created_at: true,

      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },

      followers:
        userId !== null
          ? {
              where: {
                id: userId,
              },
              select: {
                id: true,
              },
            }
          : false,

      blocked_by:
        userId !== null
          ? {
              where: {
                blocker_id: userId,
              },
              select: {
                blocked_id: true,
              },
            }
          : false,
    },
  });

  return users.map((user) => {
    const { followers, blocked_by, ...rest } = user;

    return {
      ...rest,
      is_followed: Array.isArray(followers) && followers.length > 0,
      is_blocked: !!blocked_by?.length,
    };
  });
};

export const isUserBlocked = async (
  userIdA: number,
  userIdB: number
): Promise<boolean> => {
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        {
          blocker_id: userIdA,
          blocked_id: userIdB,
        },
        {
          blocker_id: userIdB,
          blocked_id: userIdA,
        },
      ],
    },
    select: { blocked_id: true },
  });

  return !!block;
};
