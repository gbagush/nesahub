import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = (await params).id;
        const following = await db.user.findMany({
            where: {
                followers: {
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
        if (following.length === 0) {
            return NextResponse.json({ message: "Following not found" }, { status: 404 });
        }
        return  NextResponse.json({
            message: "Following found",
            data: following,
        })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
}