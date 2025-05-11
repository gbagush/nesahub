import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";



export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }){
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const postId = Number((await params).id);

        const post = await db.post.findUnique({
            where: { id: postId },
            include: {
                saved_by: true,
            },
        });

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        const alreadySaved = post.saved_by.some((user) => user.clerk_id === userId);

        if (alreadySaved) {
            return NextResponse.json(
                { message: "You already saved this post" },
                { status: 200 }
            );
        }

        await db.post.update({
            where: { id: postId },
            data: {
                saved_by: {
                    connect: { clerk_id: userId },
                },
            },
        });

        return NextResponse.json({ message: "Post saved successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}