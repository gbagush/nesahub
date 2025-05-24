import { db } from "@/lib/db";
import { getPost } from "@/services/post";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import extractHashtags from "@/lib/extractHashtags";
import { containsBadWord } from "@/lib/badWordsChecker/main";
import { deleteFromFTP, uploadToFtp } from "@/lib/ftp";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    let internalUserId: number | null = null;

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerk_id: userId },
        select: { id: true },
      });
      internalUserId = user?.id ?? null;
    }

    const postId = (await params).id;

    const post = await getPost({
      id: parseInt(postId, 10),
      userId: internalUserId ? internalUserId : undefined,
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    (post as any).is_liked = post.liked_by?.length > 0;
    (post as any).is_disliked = post.disliked_by?.length > 0;
    (post as any).is_reposted = post.reposted_by?.length > 0;
    (post as any).is_saved = post.saved_by?.length > 0;

    delete (post as any).liked_by;
    delete (post as any).disliked_by;
    delete (post as any).reposted_by;
    delete (post as any).saved_by;

    return NextResponse.json({
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error: Failed fetching post: ", error);
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

    const postId = parseInt((await params).id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const existingPost = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        media: true,
        postTags: {
          include: {
            hashtag: true,
          },
        },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (existingPost.author?.clerk_id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();

    const content = formData.get("content")?.toString() || "";
    const giphy = formData.get("giphy")?.toString() || "";

    const keepMediaIds = formData
      .getAll("keepMedia")
      .map((id) => parseInt(id.toString()))
      .filter((id) => !isNaN(id));

    const newMediaFiles = formData.getAll("newMedia") as File[];

    if (
      content.trim().length < 10 &&
      (!giphy || giphy.trim() === "") &&
      keepMediaIds.length === 0 &&
      newMediaFiles.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "You must provide at least content (min 10 chars), a GIF, or media.",
        },
        { status: 400 }
      );
    }

    const totalMediaCount =
      keepMediaIds.length + newMediaFiles.length + (giphy ? 1 : 0);
    if (totalMediaCount > MAX_IMAGES) {
      return NextResponse.json(
        { message: "You can only have up to 3 media items." },
        { status: 400 }
      );
    }

    for (const file of newMediaFiles) {
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

    const newSavedMedia: any = [];
    for (const file of newMediaFiles) {
      const ftpPath = await uploadToFtp(file);
      newSavedMedia.push({
        source: "USERCONTENT" as const,
        path: ftpPath,
      });
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

    const updatedPost = await db.$transaction(async (tx) => {
      await tx.postHashtag.deleteMany({
        where: { postId: postId },
      });

      const mediaToDelete = existingPost.media.filter((media) => {
        // Delete if not in keepMediaIds, or if it's a GIPHY media and we received new giphy or empty string
        return (
          (!keepMediaIds.includes(media.id) && media.source !== "GIPHY") ||
          (media.source === "GIPHY" && giphy !== media.path)
        );
      });

      if (mediaToDelete.length > 0) {
        await tx.postMedia.deleteMany({
          where: {
            id: { in: mediaToDelete.map((m) => m.id) },
          },
        });

        for (const media of mediaToDelete) {
          if (media.source === "USERCONTENT") {
            await deleteFromFTP(media.path);
          }
        }
      }

      const post = await tx.post.update({
        where: { id: postId },
        data: {
          content: content || "",
          updated_at: new Date(),
          postTags: {
            create: hashtagRecords.map((hashtag) => ({
              hashtag: { connect: { id: hashtag.id } },
            })),
          },
          media: {
            create: [
              ...newSavedMedia,
              ...(giphy ? [{ source: "GIPHY" as const, path: giphy }] : []),
            ],
          },
        },
        include: {
          media: true,
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              profile_pict: true,
            },
          },
          _count: {
            select: {
              replies: true,
              liked_by: true,
              disliked_by: true,
              reposted_by: true,
              saved_by: true,
            },
          },
        },
      });

      return post;
    });

    return NextResponse.json(
      {
        message: "Post updated successfully",
        data: {
          ...updatedPost,
          media: updatedPost.media.map((m) => ({
            id: m.id,
            source: m.source,
            path: m.path,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Post update failed:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt((await params).id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: {
        id: postId,
        author: {
          clerk_id: userId,
        },
      },
      include: {
        media: true,
      },
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

    const userMedia = post.media.filter((m) => m.source === "USERCONTENT");

    for (const media of userMedia) {
      await deleteFromFTP(media.path);
    }

    await db.postMedia.deleteMany({
      where: {
        id: { in: userMedia.map((m) => m.id) },
      },
    });

    return NextResponse.json({
      message: "Post and associated media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
