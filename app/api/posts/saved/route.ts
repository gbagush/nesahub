import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    const savedPosts = await db.post.findMany({
      where: {
        saved_by: {
          some: {
            clerk_id: userId,
          },
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
        liked_by: user?.id
          ? {
              where: { id: user?.id },
              select: { id: true },
            }
          : false,
        disliked_by: user?.id
          ? {
              where: { id: user?.id },
              select: { id: true },
            }
          : false,
        reposted_by: user?.id
          ? {
              where: { id: user?.id },
              select: { id: true },
            }
          : false,
        saved_by: user?.id
          ? {
              where: { id: user?.id },
              select: { id: true },
            }
          : false,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    for (const post of savedPosts as any[]) {
      post.is_liked = post.liked_by?.length > 0;
      post.is_disliked = post.disliked_by?.length > 0;
      post.is_reposted = post.reposted_by?.length > 0;
      post.is_saved = post.saved_by?.length > 0;

      delete post.liked_by;
      delete post.disliked_by;
      delete post.reposted_by;
      delete post.saved_by;
    }

    return NextResponse.json(
      { mesage: "Success getting all saved posts.", data: savedPosts },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
