import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const PostSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(5000, "Content must be at most 5000 characters long"),
  parent_id: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content, parent_id } = parsed.data;

    const user = await db.user.findUnique({
      where: {
        clerk_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const savedPost = await db.post.create({
      data: {
        content,
        author: {
          connect: { id: user.id },
        },
        ...(parent_id && {
          parent: { connect: { id: parent_id } },
        }),
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        data: {
          ...savedPost,
          author: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            profile_pict: user.profile_pict,
          },
          _count: {
            liked_by: 0,
            disliked_by: 0,
            reposted_by: 0,
            saved_by: 0,
          },
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    const posts = await db.post.findMany({
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
              where: { id: internalUserId },
              select: { id: true },
            }
          : false,
        disliked_by: internalUserId
          ? {
              where: { id: internalUserId },
              select: { id: true },
            }
          : false,
        reposted_by: internalUserId
          ? {
              where: { id: internalUserId },
              select: { id: true },
            }
          : false,
        saved_by: internalUserId
          ? {
              where: { id: internalUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { created_at: "desc" },
    });

    for (const post of posts as any[]) {
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
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log("Error: Error while fetching posts:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
