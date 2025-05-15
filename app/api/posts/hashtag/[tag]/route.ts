import { db } from "@/lib/db";
import { getPosts } from "@/services/post";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const hashtag = (await params).tag;

    if (!hashtag) {
      return NextResponse.json(
        { message: "Hashtag parameter is required" },
        { status: 400 }
      );
    }

    const tagToSearch = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

    const posts = await getPosts({
      where: {
        postTags: {
          some: {
            hashtag: {
              tag: tagToSearch,
            },
          },
        },
      },
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts by hashtag:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
