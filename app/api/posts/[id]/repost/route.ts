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

    const existingRepost = await db.postRepost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userIdOnly,
        },
      },
    });

    if (existingRepost) {
      return NextResponse.json(
        { message: "You've already reposted this post" },
        { status: 400 }
      );
    }

    await db.postRepost.create({
      data: {
        postId,
        userId: userIdOnly,
      },
    });

    return NextResponse.json(
      { message: "Post reposted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Repost error:", err);
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

    await db.postRepost.deleteMany({
      where: {
        postId,
        userId: userIdOnly,
      },
    });

    return NextResponse.json(
      { message: "Repost removed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unrepost error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
