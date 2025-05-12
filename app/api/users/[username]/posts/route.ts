import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";



export async function GET(_: NextRequest, { params } : { params: Promise <{ username: string }>}) {
    try {
        const userUsername = await db.user.findUnique({
            where: {
                username: (await params).username
            }
        });
        const posts = await db.post.findMany({
            where: {
                user_id: Number(userUsername?.id),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        username: true,
                        profile_pict: true
                    }
                },
                _count: {
                    select: {
                        liked_by: true,
                        disliked_by: true,
                        reposted_by: true,
                        saved_by: true,
                    },
                },
            },
        });

        if (posts.length === 0) {
            return NextResponse.json({ message: "Posts not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Posts fetched successfully",
            data: posts,
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}