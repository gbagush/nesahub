import { db } from "@/lib/db";
import { getUserByClerkId } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const allReportGroups = await db.postReport.groupBy({
      by: ["postId", "category"],
      where: {
        status: "PENDING",
      },
      _count: {
        id: true,
      },
    });

    const postReportCounts: Record<number, number> = {};
    allReportGroups.forEach((group) => {
      if (!postReportCounts[group.postId]) {
        postReportCounts[group.postId] = 0;
      }
      postReportCounts[group.postId] += group._count.id;
    });

    const sortedPostIds = Object.entries(postReportCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([postId]) => parseInt(postId));

    const paginatedPostIds = sortedPostIds.slice(offset, offset + limit);

    const paginatedReportGroups = allReportGroups.filter((group) =>
      paginatedPostIds.includes(group.postId)
    );

    const postsWithReports = await db.post.findMany({
      where: {
        id: {
          in: paginatedPostIds,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            profile_pict: true,
          },
        },
        aiBot: {
          select: {
            id: true,
            name: true,
            username: true,
            profile_pict: true,
          },
        },
        media: {
          select: {
            id: true,
            source: true,
            path: true,
          },
        },
      },
    });

    const postStats: Record<
      number,
      {
        post: any;
        totalReports: number;
        categoryCounts: Record<string, number>;
      }
    > = {};

    postsWithReports.forEach((post) => {
      postStats[post.id] = {
        post,
        totalReports: 0,
        categoryCounts: {
          SPAM: 0,
          HARASSMENT: 0,
          FALSE_INFORMATION: 0,
          HATE_SPEECH: 0,
          NUDITY: 0,
          VIOLENCE: 0,
          OTHER: 0,
        },
      };
    });

    paginatedReportGroups.forEach((group) => {
      const stat = postStats[group.postId];
      if (stat) {
        stat.totalReports += group._count.id;
        stat.categoryCounts[group.category] += group._count.id;
      }
    });

    const result = paginatedPostIds
      .map((postId) => postStats[postId])
      .filter(Boolean);

    const totalPosts = sortedPostIds.length;
    const totalPages = Math.ceil(totalPosts / limit);

    return NextResponse.json(
      {
        data: result,
        meta: {
          currentPage: page,
          totalPages,
          totalPosts,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
