import { db } from "@/lib/db";
import { getUserByClerkId } from "@/services/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { subDays, format } from "date-fns";

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

    const [userCount, postCount, pendingReportsCount] = await Promise.all([
      db.user.count({ where: { deleted_at: null } }),
      db.post.count({ where: { deleted_at: null } }),
      db.postReport.count({ where: { status: "PENDING" } }),
    ]);

    const today = new Date();
    const thisWeekStart = subDays(today, 6);
    const lastWeekStart = subDays(today, 13);
    const lastWeekEnd = subDays(today, 7);

    const [usersThisWeek, postsThisWeek] = await Promise.all([
      db.user.groupBy({
        by: ["created_at"],
        where: {
          created_at: {
            gte: thisWeekStart,
          },
        },
        _count: true,
      }),
      db.post.groupBy({
        by: ["created_at"],
        where: {
          created_at: {
            gte: thisWeekStart,
          },
        },
        _count: true,
      }),
    ]);

    const thisWeekUserCount = usersThisWeek.reduce(
      (sum, u) => sum + u._count,
      0
    );
    const thisWeekPostCount = postsThisWeek.reduce(
      (sum, p) => sum + p._count,
      0
    );

    const [usersLastWeek, postsLastWeek] = await Promise.all([
      db.user.count({
        where: {
          created_at: {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          },
        },
      }),
      db.post.count({
        where: {
          created_at: {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          },
        },
      }),
    ]);

    const calcGrowth = (current: number, previous: number) =>
      Number((((current - previous) / Math.max(previous, 1)) * 100).toFixed(1));

    const userGrowth = calcGrowth(thisWeekUserCount, usersLastWeek);
    const postGrowth = calcGrowth(thisWeekPostCount, postsLastWeek);

    const formatCounts = (items: { created_at: Date; _count: number }[]) => {
      const map = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const dateStr = format(subDays(today, i), "yyyy-MM-dd");
        map.set(dateStr, 0);
      }

      for (const item of items) {
        const dateStr = format(item.created_at, "yyyy-MM-dd");
        if (map.has(dateStr)) {
          map.set(dateStr, (map.get(dateStr) || 0) + item._count);
        }
      }

      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
    };

    const weeklyUserStats = formatCounts(usersThisWeek);
    const weeklyPostStats = formatCounts(postsThisWeek);

    return NextResponse.json(
      {
        message: "Success getting stats",
        data: {
          counts: {
            users: userCount,
            posts: postCount,
            pendingReports: pendingReportsCount,
          },
          growth: {
            users: userGrowth,
            posts: postGrowth,
          },
          graphs: {
            users: weeklyUserStats,
            posts: weeklyPostStats,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error get stats:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
