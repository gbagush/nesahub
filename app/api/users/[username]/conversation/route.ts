import { db } from "@/lib/db";
import { createConversation } from "@/services/message";
import { getUserByClerkId, getUserByUsername } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.username === (await params).username) {
      return NextResponse.json(
        { message: "You cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    const targetUser = await getUserByUsername({
      username: (await params).username,
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Target user not found" },
        { status: 404 }
      );
    }

    const conversation = await createConversation({
      userIds: [user.id, targetUser.id],
    });

    return NextResponse.json(
      { message: "Success getting conversation", data: conversation },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error: error while creating conversation ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
