import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

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
      include: {
        liked_by: true,
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await db.post.update({
      where: { id: postId },
      data: {
        liked_by: {
          disconnect: { clerk_id: userId },
        },
        disliked_by: {
          connect: { clerk_id: userId },
        },
      },
    });

    return NextResponse.json({ message: "Post disliked successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
