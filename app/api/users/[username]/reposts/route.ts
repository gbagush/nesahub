import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    const { username } = await params;

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

    const repostRelations = await db.postRepost.findMany({
      where: {
        user: {
          username,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      select: {
        postId: true,
        created_at: true,
      },
    });

    const postIds = repostRelations.map((relation) => relation.postId);

    const repostTimeMap = repostRelations.reduce(
      (acc, { postId, created_at }) => {
        acc[postId] = created_at;
        return acc;
      },
      {} as Record<number, Date>
    );

    const posts = await db.post.findMany({
      where: {
        id: {
          in: postIds,
        },
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

    const orderedPosts = [...posts].sort((a, b) => {
      const timeA = repostTimeMap[a.id].getTime();
      const timeB = repostTimeMap[b.id].getTime();
      return timeB - timeA;
    });

    for (const post of orderedPosts as any[]) {
      post.is_liked = post.liked_by?.length > 0;
      post.is_disliked = post.disliked_by?.length > 0;
      post.is_reposted = post.reposted_by?.length > 0;
      post.is_saved = post.saved_by?.length > 0;
      post.reposted_at = repostTimeMap[post.id];

      delete post.liked_by;
      delete post.disliked_by;
      delete post.reposted_by;
      delete post.saved_by;
    }

    return NextResponse.json({
      message: "Posts fetched successfully",
      data: orderedPosts,
      meta: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.log("Error: Error while fetching posts:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
