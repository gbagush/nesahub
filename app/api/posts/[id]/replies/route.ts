import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
    const replies = await db.post.findMany({
      where: {
        parent_id: Number(postId),
      },
      include: {
        parent: {
          include: {
            author: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                profile_pict: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            profile_pict: true,
          },
        },
        _count: {
          select: {
            replies: true,
            liked_by: true,
            disliked_by: true,
            reposted_by: true,
            saved_by: true,
          },
        },
        liked_by: internalUserId
          ? {
              where: { userId: internalUserId },
              select: { userId: true },
            }
          : false,
        disliked_by: internalUserId
          ? {
              where: { userId: internalUserId },
              select: { userId: true },
            }
          : false,
        reposted_by: internalUserId
          ? {
              where: { userId: internalUserId },
              select: { userId: true },
            }
          : false,
        saved_by: internalUserId
          ? {
              where: { userId: internalUserId },
              select: { userId: true },
            }
          : false,
      },
    });

    for (const post of replies as any[]) {
      post.is_liked = post.liked_by?.length > 0;
      post.is_disliked = post.disliked_by?.length > 0;
      post.is_reposted = post.reposted_by?.length > 0;
      post.is_saved = post.saved_by?.length > 0;

      delete post.liked_by;
      delete post.disliked_by;
      delete post.reposted_by;
      delete post.saved_by;
    }

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
