import { db } from "@/lib/db";

export const createConversation = async ({
  userIds,
}: {
  userIds: number[];
}) => {
  if (userIds.length !== 2) {
    throw new Error("Only 2 users are allowed in a direct conversation.");
  }

  const existing = await db.conversation.findFirst({
    where: {
      is_group: false,
      participants: {
        every: {
          userId: { in: userIds },
        },
      },
    },
    include: {
      participants: true,
    },
  });

  if (existing) return existing;

  return await db.conversation.create({
    data: {
      is_group: false,
      participants: {
        create: userIds.map((userId) => ({
          user: { connect: { id: userId } },
        })),
      },
    },
    include: {
      participants: true,
    },
  });
};

export const getConversationById = async ({
  conversationId,
}: {
  conversationId: number;
}) => {
  const conversation = await db.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      participants: {
        include: {
          user: {
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

  return conversation;
};

export const getConversationsWithLastMessage = async ({
  userId,
  limit = 20,
  skip = 0,
}: {
  userId: number;
  limit?: number;
  skip?: number;
}) => {
  const conversations = await db.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
    skip,
    take: limit,
    include: {
      participants: {
        include: {
          user: {
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
      messages: {
        orderBy: {
          created_at: "desc",
        },
        take: 1,
      },
    },
  });

  return conversations;
};

export const getMessagesByConversationId = async ({
  conversationId,
  skip = 0,
  limit = 20,
}: {
  conversationId: number;
  skip?: number;
  limit?: number;
}) => {
  const messages = await db.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      created_at: "desc",
    },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_pict: true,
        },
      },
    },
  });

  return messages.reverse();
};

export const getOtherUserInConversation = async ({
  conversationId,
  currentUserId,
}: {
  conversationId: number;
  currentUserId: number;
}) => {
  const participants = await db.conversationParticipant.findMany({
    where: {
      conversationId,
    },
    include: {
      user: true,
    },
  });

  const otherParticipant = participants.find(
    (p) => p.user.id !== currentUserId
  );

  return otherParticipant?.user || null;
};

export const sendMessage = async ({
  conversationId,
  senderId,
  content,
}: {
  conversationId: number;
  senderId: number;
  content: string;
}) => {
  const message = await db.message.create({
    data: {
      content,
      sender: { connect: { id: senderId } },
      conversation: { connect: { id: conversationId } },
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_pict: true,
        },
      },
    },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { updated_at: new Date() },
  });

  return message;
};

export const deleteMessage = async ({ messageId }: { messageId: number }) => {
  const message = await db.message.update({
    where: { id: messageId },
    data: {
      deleted_at: new Date(),
    },
  });

  return message;
};

export const editMessage = async ({
  messageId,
  userId,
  newContent,
}: {
  messageId: number;
  userId: number;
  newContent: string;
}) => {
  const updated = await db.message.update({
    where: { id: messageId, senderId: userId, deleted_at: null },
    data: {
      content: newContent,
    },
  });

  return updated;
};
