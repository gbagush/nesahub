import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";



export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = (await params).id;
        const user = await db.user.findUnique({
            where: {
                clerk_id: userId
            }
        });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
    
}