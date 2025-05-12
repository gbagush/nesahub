import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PostSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(5000, "Content must be at most 5000 characters long")
    .optional(),
  parent_id: z.number().optional(),
});

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
    const post = await db.post.findUnique({
      where: {
        id: Number(postId),
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
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    (post as any).is_liked = post.liked_by?.length > 0;
    (post as any).is_disliked = post.disliked_by?.length > 0;
    (post as any).is_reposted = post.reposted_by?.length > 0;
    (post as any).is_saved = post.saved_by?.length > 0;

    delete (post as any).liked_by;
    delete (post as any).disliked_by;
    delete (post as any).reposted_by;
    delete (post as any).saved_by;

    return NextResponse.json({
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error: Failed fetching post: ", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const postId = (await params).id;
    const post = await db.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const parentId = await db.post.findUnique({
      where: {
        id: Number(parent_id),
      },
    });

    if (!parentId) {
      return NextResponse.json(
        { message: "Parent post not found" },
        { status: 404 }
      );
    }

    const updatedPost = await db.post.update({
      where: {
        id: Number(postId),
      },
      data: {
        content: content,
        parent_id: parent_id,
      },
    });

    return NextResponse.json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error: Failed updating post: ", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const postId = (await params).id;
    const post = await db.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    await db.post.delete({
      where: {
        id: Number(postId),
      },
    });
    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
