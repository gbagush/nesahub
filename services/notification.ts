import { db } from "@/lib/db";

export const createNotification = async ({
  recipientId,
  type,
  initiatorId,
  postId,
  message,
}: {
  recipientId: number;
  type: "NEW_FOLLOWER" | "POST_REPLY" | "POST_MENTION" | "SYSTEM_MESSAGE";
  initiatorId?: number;
  postId?: number;
  message?: string;
}) => {
  return await db.notification.create({
    data: {
      recipient_id: recipientId,
      type,
      ...(initiatorId && { initiator_id: initiatorId }),
      ...(postId && { post_id: postId }),
      ...(message && { message }),
    },
    include: {
      initiator: {
        select: {
          id: true,
          username: true,
          profile_pict: true,
          first_name: true,
          last_name: true,
        },
      },
      post: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile_pict: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });
};

export const getNotifications = async ({
  userId,
  skip = 0,
  limit = 20,
  filterType,
}: {
  userId: number;
  skip?: number;
  limit?: number;
  filterType?:
    | "NEW_FOLLOWER"
    | "POST_REPLY"
    | "POST_MENTION"
    | "SYSTEM_MESSAGE";
}) => {
  const notifications = await db.notification.findMany({
    where: {
      recipient_id: userId,
      ...(filterType && { type: filterType }),
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take: limit,
    include: {
      initiator: {
        select: {
          id: true,
          username: true,
          profile_pict: true,
          first_name: true,
          last_name: true,
        },
      },
      post: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile_pict: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });

  return notifications;
};
