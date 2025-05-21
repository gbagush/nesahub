import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/services/post";

import extractHashtags from "@/lib/extractHashtags";
import { containsBadWord } from "@/lib/badWordsChecker/main";
import { getUserByClerkId } from "@/services/user";

const PostSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters long")
    .max(5000, "Content must be at most 5000 characters long"),
  parent_id: z.number().optional(),
  giphy: z.string().optional(),
  media: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content, parent_id } = parsed.data;

    const user = await db.user.findUnique({
      where: {
        clerk_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    if (containsBadWord(content)) {
      return NextResponse.json(
        {
          message:
            "Your content contains words that are not allowed. Please review and adjust your submission.",
        },
        { status: 400 }
      );
    }

    const hashtags = extractHashtags(content);

    const hashtagRecords = await Promise.all(
      hashtags.map(async (tag) => {
        return await db.hashtag.upsert({
          where: { tag },
          update: {},
          create: { tag },
        });
      })
    );

    const savedPost = await db.post.create({
      data: {
        content,
        postTags: {
          create: hashtagRecords.map((hashtag) => ({
            hashtag: { connect: { id: hashtag.id } },
          })),
        },
        media: parsed.data.media
          ? {
              create: parsed.data.media.map((mediaPath) => ({
                source: "USERCONTENT", // asumsi media dari user, sesuaikan kalau GIPHY
                path: mediaPath,
              })),
            }
          : undefined,
        giphy: parsed.data.giphy || null,
        author: {
          connect: { id: user.id },
        },

        ...(parent_id && {
          parent: { connect: { id: parent_id } },
        }),
      },
      include: {
        media: true,
      },
    });
    const { giphy, ...rest } = savedPost;
    return NextResponse.json(
      {
        message: "Post created successfully",
        data: {
          ...rest,
          media: [
            ...savedPost.media.map((m) => ({ source: m.source, path: m.path })),
            ...(giphy ? [{ source: "GIPHY", path: giphy }] : []),
          ],
          author: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            profile_pict: user.profile_pict,
          },
          _count: {
            replies: 0,
            liked_by: 0,
            disliked_by: 0,
            reposted_by: 0,
            saved_by: 0,
          },
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    let internalUserId: number | null = null;

    if (userId) {
      const user = await getUserByClerkId({ clerk_id: userId });
      internalUserId = user?.id ?? null;
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const following = searchParams.get("following") === "true";
    const keyword = searchParams.get("keyword") || "";
    const skip = (page - 1) * limit;

    let followedIds: number[] = [];

    if (following && internalUserId) {
      const currentUser = await db.user.findUnique({
        where: { id: internalUserId },
        select: {
          following: {
            select: { id: true },
          },
        },
      });

      followedIds = currentUser?.following.map((u) => u.id) || [];
    }

    const whereClause: any = {};

    if (following) {
      whereClause.author = {
        id: {
          in: followedIds,
        },
      };
    }

    if (keyword.trim() !== "") {
      whereClause.OR = [
        {
          content: {
            contains: keyword,
          },
        },
        {
          author: {
            OR: [
              { first_name: { contains: keyword } },
              { last_name: { contains: keyword } },
              { username: { contains: keyword } },
            ],
          },
        },
      ];
    }

    const posts = await getPosts({
      where: whereClause,
      limit,
      skip,
      userId: internalUserId,
    });

    for (const post of posts as any[]) {
      post.is_liked = post.liked_by?.length > 0;
      post.is_disliked = post.disliked_by?.length > 0;
      post.is_reposted = post.reposted_by?.length > 0;
      post.is_saved = post.saved_by?.length > 0;

      delete post.liked_by;
      delete post.disliked_by;
      delete post.reposted_by;
      delete post.saved_by;
    }

    return NextResponse.json({
      message: "Posts fetched successfully",
      data: posts,
      meta: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.log("Error: Error while fetching posts:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
