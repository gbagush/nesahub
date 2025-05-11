import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
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
        data: savedPost,
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
    const posts = await db.post.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            liked_by: true,
            disliked_by: true,
            reposted_by: true,
            saved_by: true,
          },
        }
      },
    });

    return NextResponse.json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
