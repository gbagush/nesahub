import { db } from "@/lib/db";
import { getPosts } from "@/services/post";
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

    const savedPostRelations = await db.postSave.findMany({
      where: {
        user: {
          clerk_id: userId,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        postId: true,
        created_at: true,
      },
    });

    const postIds = savedPostRelations.map((relation) => relation.postId);

    const saveTimeMap = savedPostRelations.reduce(
      (acc, { postId, created_at }) => {
        acc[postId] = created_at;
        return acc;
      },
      {} as Record<number, Date>
    );

    const savedPosts = await getPosts({
      where: {
        id: {
          in: postIds,
        },
      },
      userId: user!.id,
    });

    const orderedSavedPosts = [...savedPosts].sort((a, b) => {
      const saveTimeA = saveTimeMap[a.id].getTime();
      const saveTimeB = saveTimeMap[b.id].getTime();
      return saveTimeB - saveTimeA;
    });

    for (const post of orderedSavedPosts as any[]) {
      post.is_liked = post.liked_by?.length > 0;
      post.is_disliked = post.disliked_by?.length > 0;
      post.is_reposted = post.reposted_by?.length > 0;
      post.is_saved = post.saved_by?.length > 0;
      post.saved_at = saveTimeMap[post.id];

      delete post.liked_by;
      delete post.disliked_by;
      delete post.reposted_by;
      delete post.saved_by;
    }

    return NextResponse.json(
      { mesage: "Success getting all saved posts.", data: orderedSavedPosts },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
