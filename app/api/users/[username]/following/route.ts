import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, getUsers } from "@/services/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    let internalUserId: number | null = null;

    if (userId) {
      const user = await getUserByClerkId({ clerk_id: userId });
      internalUserId = user?.id ?? null;
    }

    const userUsername = (await params).username;
    const following = await getUsers({
      where: {
        followers: {
          some: {
            username: userUsername,
          },
        },
      },
      limit: limit,
      skip: skip,
    });

    return NextResponse.json({
      message: "Success getting user following",
      data: following,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
