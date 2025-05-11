import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

import { NextRequest, NextResponse } from "next/server";

const PostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters long"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(5000, "Content must be at most 5000 characters long"),
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

    const { title, content } = parsed.data;

    const user = await db.user.findUnique({
      where: {
        clerk_id: "some-clerk-id",
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const savedPost = await db.post.create({
      data: {
        title: title,
        content: content,
        author: {
          connect: { id: user.id },
        },
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
    console.error("Error: Failed creating new post: ", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
