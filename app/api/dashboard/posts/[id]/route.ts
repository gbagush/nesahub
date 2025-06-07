import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/user";
import { reportCategories } from "@/config/site";
import { createNotification } from "@/services/notification";

const validCategoryValues = reportCategories.map((c) => c.value);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "MODERATOR" && user.role !== "SUPERUSER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { violation_type, reason } = await request.json();

    if (!violation_type) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (!validCategoryValues.includes(violation_type)) {
      return NextResponse.json(
        { message: "Invalid voliation category" },
        { status: 400 }
      );
    }

    const postId = Number((await params).id);

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    await db.post.update({
      where: { id: postId },
      data: {
        deleted_at: new Date(),
      },
    });

    await db.moderatorActionLog.create({
      data: {
        moderator_id: user.id,
        violation_type: violation_type,
        action: "DELETE_POST",
        post_id: postId,
        reason: reason || "",
      },
    });

    if (post.user_id) {
      await createNotification({
        recipientId: post.user_id!,
        type: "SYSTEM_MESSAGE",
        message: `Your post has been removed for violating our guidelines related to \"${violation_type.replace(/_/g, " ")}\". This action was taken based on a user report and verified by a moderator.`,
      });
    }

    return NextResponse.json(
      { message: "Success moderate post" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moderate post:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
