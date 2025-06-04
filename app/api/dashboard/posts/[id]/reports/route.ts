import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/user";

export async function GET(
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

    const postId = Number((await params).id);

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const reports = await db.postReport.findMany({
      where: {
        postId: post.id,
      },
      skip: offset,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            profile_pict: true,
          },
        },
      },
    });

    const total = await db.postReport.count({
      where: {
        postId: post.id,
      },
    });

    return NextResponse.json({
      message: "Success getting reports",
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error get reports:", error);
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

    const user = await getUserByClerkId({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "MODERATOR" && user.role !== "SUPERUSER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const postId = Number((await params).id);

    const { action } = await request.json();

    if (!action && action !== "REVIEWED" && action !== "DISMISSED") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const result = await db.postReport.updateMany({
      where: { postId: postId, status: "PENDING" },
      data: {
        status: action,
        processed_by_id: user.id,
      },
    });

    if (result.count > 0) {
      return NextResponse.json(
        { message: "Report proccesed successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "No changes made" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error update reports:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
