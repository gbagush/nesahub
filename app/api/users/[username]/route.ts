import { db } from "@/lib/db";
import { getUserByUsername } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const username = (await params).username;
    const { userId: clerkId } = await auth();

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        profile_pict: true,
        bio: true,
        gender: true,
        created_at: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        followers:
          clerkId !== null
            ? {
                where: {
                  clerk_id: clerkId,
                },
                select: {
                  id: true,
                },
              }
            : false,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { followers, ...rest } = user;
    const is_followed = Array.isArray(followers) && followers.length > 0;

    return NextResponse.json(
      {
        message: "Success getting user data",
        data: {
          ...rest,
          is_followed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}