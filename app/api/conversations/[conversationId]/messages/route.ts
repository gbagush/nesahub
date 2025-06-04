import axios from "axios";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/user";
import {
  createConversation,
  getMessagesByConversationId,
  getOtherUserInConversation,
  sendMessage,
} from "@/services/message";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversationId = parseInt((await params).conversationId, 10);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { message: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const messages = await getMessagesByConversationId({
      conversationId,
      skip,
      limit,
    });

    return NextResponse.json(
      { message: "Success getting messages", data: messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversationId = parseInt((await params).conversationId, 10);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { message: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { message: "Message content must be at most 500 characters" },
        { status: 400 }
      );
    }

    const newMessage = await sendMessage({
      conversationId,
      senderId: user.id,
      content,
    });

    const otherUser = await getOtherUserInConversation({
      conversationId,
      currentUserId: user.id,
    });

    const conversation = await createConversation({
      userIds: [user.id, otherUser?.id!],
    });

    try {
      await axios.post(process.env.SOCKET_WEBHOOK_BASE_URI!, {
        secret: process.env.SOCKET_WEBHOOK_SECRET,
        event: "incoming-message",
        userId: otherUser?.clerk_id,
        data: { conversation: conversation, message: newMessage },
      });
    } catch (error) {
      console.log("Error: Failed sending socket webhook ", error);
    }

    return NextResponse.json(
      { message: "Success send message", data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
