import { getConversationsWithLastMessage } from "@/services/message";
import { getUserByClerkId } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const result = await getConversationsWithLastMessage({
      userId: user.id,
    });

    return NextResponse.json(
      {
        message: "Success getting conversations",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
