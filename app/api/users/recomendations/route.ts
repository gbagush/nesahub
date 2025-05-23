import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    const internalUserId = user?.id;

    if (!internalUserId) {
      return NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      );
    }

    const currentUser = await db.user.findUnique({
      where: { id: internalUserId },
      select: {
        following: {
          select: { id: true },
        },
      },
    });

    const followingIds = currentUser?.following.map((f) => f.id) || [];
    const excludeIds = [...followingIds, internalUserId];

    const usersFollowedByMyFollowing = await db.user.findMany({
      where: {
        followers: {
          some: {
            id: { in: followingIds },
          },
        },
        id: { notIn: excludeIds },
        deleted_at: null,
        OR: [{ banned_until: null }, { banned_until: { lt: new Date() } }],
      },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        profile_pict: true,
        bio: true,
        followers: {
          where: {
            id: { in: followingIds },
          },
          select: { id: true },
        },
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
      take: 20,
    });

    const mutualConnectionRecommendations = usersFollowedByMyFollowing
      .map((user) => ({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_pict: user.profile_pict,
        bio: user.bio,
        mutual_connections: user.followers.length,
        follower_count: user._count.followers,
      }))
      .sort((a, b) => {
        if (a.mutual_connections !== b.mutual_connections) {
          return b.mutual_connections - a.mutual_connections;
        }
        return b.follower_count - a.follower_count;
      })
      .slice(0, 5);

    let recommendations = mutualConnectionRecommendations;

    if (recommendations.length < 10) {
      const usedIds = [...excludeIds, ...recommendations.map((r) => r.id)];

      const additionalUsers = await db.user.findMany({
        where: {
          id: { notIn: usedIds },
          deleted_at: null,
          OR: [{ banned_until: null }, { banned_until: { lt: new Date() } }],
        },
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          profile_pict: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
        orderBy: [{ followers: { _count: "desc" } }, { created_at: "desc" }],
        take: 10 - recommendations.length,
      });

      const formattedAdditional = additionalUsers.map((user) => ({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_pict: user.profile_pict,
        bio: user.bio,
        mutual_connections: 0,
        follower_count: user._count.followers,
      }));

      recommendations = [...recommendations, ...formattedAdditional];
    }

    return NextResponse.json({
      message: "Success getting recomendations",
      data: recommendations.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
