import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getNotifications } from "@/services/notification";
import { getUserByClerkId } from "@/services/user";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const rawType = searchParams.get("type");
    const skip = (page - 1) * limit;

    type NotificationType =
      | "NEW_FOLLOWER"
      | "POST_REPLY"
      | "POST_MENTION"
      | "SYSTEM_MESSAGE";
    const ALLOWED_TYPES: NotificationType[] = [
      "NEW_FOLLOWER",
      "POST_REPLY",
      "POST_MENTION",
      "SYSTEM_MESSAGE",
    ];

    let filterType: NotificationType | undefined = undefined;

    if (rawType !== null && rawType !== "") {
      if (ALLOWED_TYPES.includes(rawType as NotificationType)) {
        filterType = rawType as NotificationType;
      } else {
        return NextResponse.json(
          { message: `Invalid notification type: ${rawType}` },
          { status: 400 }
        );
      }
    }

    const notifications = await getNotifications({
      userId: user.id,
      limit,
      skip,
      filterType,
    });

    return NextResponse.json(
      {
        message: "Success getting notifications",
        data: notifications,
        meta: {
          page: page,
          limit: limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch notification:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
