import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const userUsername = (await params).username;
    const followers = await db.user.findMany({
      where: {
        following: {
          some: {
            username: userUsername,
          },
        },
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Success getting user followers",
      data: followers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
