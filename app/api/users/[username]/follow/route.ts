import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest, { params } : { params: Promise <{ username: string }>}){
   try {
       const { userId } = await auth();
       if (!userId) {
           return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
       }

       const user = await db.user.findUnique({
           where: {
               clerk_id: userId
           }
       });

       if (!user) {
           return NextResponse.json({ message: "User not found" }, { status: 400 });
       }

       if (user.username === (await params).username) {
           return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
       }

       const followedUser = await db.user.findUnique({
           where: {
               username: (await params).username
           }
       });

       if (!followedUser) {
           return NextResponse.json({ message: "Followed user not found" }, { status: 400 });
       }

       const alreadyFollowing = await db.user.findUnique({
           where: {
               clerk_id: userId
           },
           select: {
               following: {
                   where: {
                       username: (await params).username
                   }
               }
           }
       });

       if (alreadyFollowing?.following.length) {
           return NextResponse.json({ message: "You already follow this user" }, { status: 400 });
       }

       await db.user.update({
           where: {
               clerk_id: userId
           },
           data: {
               following: {
                   connect: {
                       username: (await params).username
                   }
               }
           }
       });

       return NextResponse.json({ message: "Successfully followed user" }, { status: 200 });
   } catch (error) {
       return NextResponse.json({ message: "Internal server error." }, { status: 500 })
   }
}
export async function DELETE(_: NextRequest, { params } : { params: Promise <{ username: string }>}){
   try {
       const { userId } = await auth();
       if (!userId) {
           return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
       }

       const user = await db.user.findUnique({
           where: {
               clerk_id: userId
           }
       });

       if (!user) {
           return NextResponse.json({ message: "User not found" }, { status: 400 });
       }

       if (user.username === (await params).username) {
           return NextResponse.json({ message: "You cannot unfollow yourself" }, { status: 400 });
       }

       const followedUser = await db.user.findUnique({
           where: {
               username: (await params).username
           }
       });

       if (!followedUser) {
           return NextResponse.json({ message: "Followed user not found" }, { status: 400 });
       }


       await db.user.update({
           where: {
               clerk_id: userId
           },
           data: {
               following: {
                   disconnect: {
                       username: (await params).username
                   }
               }
           }
       });

       return NextResponse.json({ message: "Successfully unfollowed user" }, { status: 200 });
   } catch (error) {
       return NextResponse.json({ message: "Internal server error." }, { status: 500 })
   }
}