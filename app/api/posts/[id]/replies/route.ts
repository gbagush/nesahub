import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/services/post";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    let internalUserId: number | null = null;

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerk_id: userId },
        select: { id: true },
      });
      internalUserId = user?.id ?? null;
    }

    const postId = (await params).id;
    const replies = await getPosts({
      where: {
        parent_id: Number(postId),
      },
      sort: "asc",
    });

    return NextResponse.json({
      message: "Replies fetched successfully",
      data: replies,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
