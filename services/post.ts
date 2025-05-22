import { db } from "@/lib/db";

export const getPost = async ({
  id,
  userId,
}: {
  id: number;
  userId?: number;
}) => {
  return await db.post.findUnique({
    where: {
      id: id,
    },
    include: {
      parent: {
        include: {
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              profile_pict: true,
            },
          },
          aiBot: {
            select: {
              id: true,
              name: true,
              username: true,
              profile_pict: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          username: true,
          profile_pict: true,
        },
      },
      aiBot: {
        select: {
          id: true,
          name: true,
          username: true,
          profile_pict: true,
        },
      },
      media: {
        select: {
          source: true,
          path: true,
        },
      },
      _count: {
        select: {
          replies: true,
          liked_by: true,
          disliked_by: true,
          reposted_by: true,
          saved_by: true,
        },
      },
      liked_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      disliked_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      reposted_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      saved_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
    },
  });
};

export const getPosts = async ({
  where,
  limit,
  skip,
  userId,
  sort = "desc",
}: {
  where: any;
  limit?: number;
  skip?: number;
  userId?: number | null;
  sort?: "desc" | "asc";
}) => {
  return await db.post.findMany({
    where,
    skip,
    take: limit,
    include: {
      parent: {
        include: {
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              profile_pict: true,
            },
          },
          aiBot: {
            select: {
              id: true,
              name: true,
              username: true,
              profile_pict: true,
            },
          },
        },
      },
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          username: true,
          profile_pict: true,
        },
      },
      aiBot: {
        select: {
          id: true,
          name: true,
          username: true,
          profile_pict: true,
        },
      },
      media: {
        select: {
          source: true,
          path: true,
        },
      },
      _count: {
        select: {
          replies: true,
          liked_by: true,
          disliked_by: true,
          reposted_by: true,
          saved_by: true,
        },
      },
      liked_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      disliked_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      reposted_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
      saved_by: userId
        ? {
            where: { userId: userId },
            select: { userId: true },
          }
        : false,
    },
    orderBy: { created_at: sort },
  });
};
