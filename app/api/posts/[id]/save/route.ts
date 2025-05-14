import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = Number((await params).id);

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id: userIdOnly } = user;

    const existingSave = await db.postSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userIdOnly,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { message: "Post already saved" },
        { status: 400 }
      );
    }

    await db.postSave.create({
      data: {
        postId,
        userId: userIdOnly,
      },
    });

    return NextResponse.json(
      { message: "Post saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save error:", error);
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = Number((await params).id);

    const user = await db.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { id: userIdOnly } = user;

    await db.postSave.deleteMany({
      where: {
        postId,
        userId: userIdOnly,
      },
    });

    return NextResponse.json(
      { message: "Post unsaved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unsave error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
