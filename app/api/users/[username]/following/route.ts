import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const userUsername = (await params).username;
    const following = await db.user.findMany({
      where: {
        followers: {
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
      message: "Success getting user following",
      data: following,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
