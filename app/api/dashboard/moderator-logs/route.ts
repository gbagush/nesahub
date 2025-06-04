import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    if (user.role !== "MODERATOR" && user.role !== "SUPERUSER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const logs = await db.moderatorActionLog.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        moderator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            profile_pict: true,
          },
        },
      },
    });

    const total = await db.moderatorActionLog.count();

    return NextResponse.json({
      message: "Success getting moderator activity logs",
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error get moderation logs:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
