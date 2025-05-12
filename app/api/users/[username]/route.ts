import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const username = (await params).username;
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        profile_pict: true,
        created_at: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
