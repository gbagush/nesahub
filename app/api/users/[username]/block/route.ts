import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: {
        clerk_id: userId,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "Current user not found" },
        { status: 404 }
      );
    }

    const targetUsername = (await params).username;

    if (currentUser.username === targetUsername) {
      return NextResponse.json(
        { message: "You cannot block yourself" },
        { status: 400 }
      );
    }

    const userToBlock = await db.user.findUnique({
      where: {
        username: targetUsername,
      },
    });

    if (!userToBlock) {
      return NextResponse.json(
        { message: "User to block not found" },
        { status: 404 }
      );
    }

    const existingBlock = await db.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: currentUser.id,
          blocked_id: userToBlock.id,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { message: "You have already blocked this user" },
        { status: 400 }
      );
    }

    await db.userBlock.create({
      data: {
        blocker_id: currentUser.id,
        blocked_id: userToBlock.id,
      },
    });

    return NextResponse.json(
      { message: "Successfully blocked user" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: {
        clerk_id: userId,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "Current user not found" },
        { status: 404 }
      );
    }

    const targetUsername = (await params).username;

    if (currentUser.username === targetUsername) {
      return NextResponse.json(
        { message: "You cannot unblock yourself" },
        { status: 400 }
      );
    }

    const userToUnblock = await db.user.findUnique({
      where: {
        username: targetUsername,
      },
    });

    if (!userToUnblock) {
      return NextResponse.json(
        { message: "User to unblock not found" },
        { status: 404 }
      );
    }

    const existingBlock = await db.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: currentUser.id,
          blocked_id: userToUnblock.id,
        },
      },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { message: "You are not blocking this user" },
        { status: 400 }
      );
    }

    await db.userBlock.delete({
      where: {
        blocker_id_blocked_id: {
          blocker_id: currentUser.id,
          blocked_id: userToUnblock.id,
        },
      },
    });

    return NextResponse.json(
      { message: "Successfully unblocked user" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
