import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { reportCategories } from "@/config/site";

const validCategoryValues = reportCategories.map((c) => c.value);

export async function POST(
  request: NextRequest,
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
    const { category, details } = await request.json();

    if (!validCategoryValues.includes(category)) {
      return NextResponse.json(
        { message: "Invalid report category" },
        { status: 400 }
      );
    }

    if (category === "OTHER" && (!details || details.trim() === "")) {
      return NextResponse.json(
        { message: "Details are required for category OTHER" },
        { status: 400 }
      );
    }

    if (details && details.length > 500) {
      return NextResponse.json(
        { message: "Details must not exceed 500 characters" },
        { status: 400 }
      );
    }

    const existingReport = await db.postReport.findFirst({
      where: {
        postId: postId,
        userId: userIdOnly,
        status: "PENDING",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        {
          message:
            "You have already reported this post. Your report is currently under review.",
        },
        { status: 400 }
      );
    }

    await db.postReport.create({
      data: {
        postId: postId,
        userId: userIdOnly,
        category,
        reason: details ? details.trim() : null,
      },
    });

    return NextResponse.json({ message: "Post reported successfully" });
  } catch (error) {
    console.error("Post report error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
