import { db } from "@/lib/db";
import { getUserByIdForFollowing, getUsers } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    let internalUserId: number | null = null;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;
    const keyword = searchParams.get("keyword") || "";

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerk_id: userId },
        select: { id: true },
      });
      internalUserId = user?.id ?? null;
    }

    const whereClause: any = {};

    if (keyword.trim() !== "") {
      whereClause.OR = [
        { first_name: { contains: keyword, } },
        { last_name: { contains: keyword, } },
        { username: { contains: keyword, } },
      ];
    }

    if (internalUserId !== null) {
      whereClause.id = { not: internalUserId };
    }

    let followedIds: number[] = [];

    if (internalUserId) {
      const currentUser = await getUserByIdForFollowing({
        id: String(internalUserId),
      })

      followedIds = currentUser?.following.map((u) => u.id) || [];
    }

    const users = await getUsers({
      where: whereClause,
      limit,
      skip,
    })

    const usersWithFollowStatus = users.map((user) => ({
      ...user,
      is_followed: followedIds.includes(user.id),
    }));

    return NextResponse.json({ users: usersWithFollowStatus }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
