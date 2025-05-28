import { markConversationAsRead } from "@/services/message";
import { getUserByClerkId } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
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

    const conversationId = parseInt((await params).conversationId);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { message: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    await markConversationAsRead({
      userId: user.id,
      conversationId: conversationId,
    });

    return NextResponse.json(
      {
        message: "Conversation marked as read",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error read conversation:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
