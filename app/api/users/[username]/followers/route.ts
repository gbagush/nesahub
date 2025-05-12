import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = (await params).id;
        const followers = await db.user.findMany({
            where: {
                following: {
                    some: {
                        clerk_id: userId
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    }
                }
            }
        });
        if (followers.length === 0) {
            return NextResponse.json({ message: "Followers not found" }, { status: 404 });
        }
        return NextResponse.json({
            message: "Followers found",
            data: followers,
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
}