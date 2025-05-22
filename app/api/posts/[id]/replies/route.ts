import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/services/post";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: postId } = await params;

    let internalUserId: number | null = null;

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerk_id: userId },
        select: { id: true },
      });
      internalUserId = user?.id ?? null;
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const replies = await getPosts({
      where: {
        parent_id: Number(postId),
      },
      sort: "asc",
      limit,
      skip,
      userId: internalUserId,
    });

    for (const reply of replies as any[]) {
      reply.is_liked = reply.liked_by?.length > 0;
      reply.is_disliked = reply.disliked_by?.length > 0;
      reply.is_reposted = reply.reposted_by?.length > 0;
      reply.is_saved = reply.saved_by?.length > 0;

      delete reply.liked_by;
      delete reply.disliked_by;
      delete reply.reposted_by;
      delete reply.saved_by;
    }

    return NextResponse.json({
      message: "Replies fetched successfully",
      data: replies,
      meta: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error while fetching replies:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
