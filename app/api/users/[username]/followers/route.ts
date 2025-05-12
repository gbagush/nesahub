import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(_: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        const userUsername = (await params).username;
        const followers = await db.user.findMany({
            where: {
                following: {
                    some: {
                        username: userUsername
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