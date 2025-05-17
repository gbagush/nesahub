import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";



const allowedFields = ["bio", "gender"];
const PostSchema = z.object({
  bio: z.string().max(160).optional(),
  gender: z.enum(["MALE", "FEMALE", "NOT_SET"]).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerk_id: clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const invalidFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        {
          message: "Invalid fields in request body",
          invalidFields,
        },
        { status: 400 }
      );
    }

    const parsed = PostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { bio, gender } = parsed.data;

    const updatedUser = await db.user.update({
      where: { clerk_id: user.clerk_id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(gender !== undefined && { gender }),
      },
    });

    return NextResponse.json(
      { message: "User updated successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
