import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/services/post";

import extractHashtags from "@/lib/extractHashtags";
import { containsBadWord } from "@/lib/badWordsChecker/main";
import { getUserByClerkId } from "@/services/user";
import { uploadToFtp } from "@/lib/ftp";
import { getOXAResponseAndReply } from "@/lib/oxa-ai";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const content = formData.get("content")?.toString() || "";
    const giphy = formData.get("giphy")?.toString() || "";
    const parent_id = formData.get("parent_id")
      ? Number(formData.get("parent_id"))
      : undefined;

    const mediaFiles = formData.getAll("media") as File[];

    if (
      content.trim().length < 10 &&
      (!giphy || giphy.trim() === "") &&
      mediaFiles.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "You must provide at least content (min 10 chars), a GIF, or media.",
        },
        { status: 400 }
      );
    }

    if (mediaFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        { message: "You can only upload up to 3 images." },
        { status: 400 }
      );
    }

    const savedMedia = [];

    for (const file of mediaFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: `Unsupported file type: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            message: `Image "${file.name}" exceeds the 1MB limit.`,
          },
          { status: 400 }
        );
      }

      const ftpPath = await uploadToFtp(file);
      savedMedia.push({
        source: "USERCONTENT" as const,
        path: ftpPath,
      });
    }

    const user = await db.user.findUnique({
      where: { clerk_id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    if (content && containsBadWord(content)) {
      return NextResponse.json(
        {
          message:
            "Your content contains words that are not allowed. Please review and adjust your submission.",
        },
        { status: 400 }
      );
    }

    const hashtags = content ? extractHashtags(content) : [];

    const hashtagRecords = await Promise.all(
      hashtags.map((tag) =>
        db.hashtag.upsert({
          where: { tag },
          update: {},
          create: { tag },
        })
      )
    );

    const savedPost = await db.post.create({
      data: {
        content: content || "",
        postTags: {
          create: hashtagRecords.map((hashtag) => ({
            hashtag: { connect: { id: hashtag.id } },
          })),
        },
        media: {
          create: [
            ...savedMedia,
            ...(giphy ? [{ source: "GIPHY" as const, path: giphy }] : []),
          ],
        },
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

    if (content.toLowerCase().startsWith("@oxa")) {
      const messageToAI = content.replace(/^@oxa\s*/i, "").trim();

      if (messageToAI.length > 0) {
        getOXAResponseAndReply({
          message: messageToAI,
          postId: savedPost.id,
        }).catch((e) => console.error("OXA Auto-reply failed:", e));
      }
    }

    return NextResponse.json(
      {
        message: "Post created successfully",
        data: {
          ...savedPost,
          media: savedPost.media.map((m) => ({
            source: m.source,
            path: m.path,
          })),
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
      { status: 201 }
    );
  } catch (error) {
    console.error("Post creation failed:", error);
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
