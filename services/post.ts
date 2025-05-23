import { db } from "@/lib/db";

export const getPost = async ({
  id,
  userId,
}: {
  id: number;
  userId?: number;
}) => {
  const post = await db.post.findUnique({
    where: {
      id: id,
      deleted_at: null,
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
          id: true,
          source: true,
          path: true,
        },
      },
      _count: {
        select: {
          replies: {
            where: {
              deleted_at: null,
            },
          },
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

  if (!post) return null;

  if (post.parent && post.parent.deleted_at !== null) {
    const { parent, ...rest } = post;
    return {
      ...rest,
      is_parent_deleted: true,
    };
  }

  return post;
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
  const posts = await db.post.findMany({
    where: {
      ...where,
      deleted_at: null,
    },
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
          id: true,
          source: true,
          path: true,
        },
      },
      _count: {
        select: {
          replies: {
            where: {
              deleted_at: null,
            },
          },
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

  return posts.map((post) => {
    if (post.parent && post.parent.deleted_at !== null) {
      const { parent, ...rest } = post;
      return {
        ...rest,
        is_parent_deleted: true,
      };
    }
    return post;
  });
};
