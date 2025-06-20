import { db } from "@/lib/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created") {
      const {
        id,
        first_name,
        last_name,
        username,
        email_addresses,
        image_url,
      } = evt.data;

      if (!first_name || !last_name || !username) {
        return NextResponse.json(
          {
            message: "Missing required fileds",
          },
          { status: 400 }
        );
      }

      try {
        const newUser = await db.user.create({
          data: {
            clerk_id: id,
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email_addresses[0].email_address,
            profile_pict: image_url,
          },
        });

        return NextResponse.json({ newUser }, { status: 201 });
      } catch (error) {
        console.error(
          "Error: Failed to store event 'user.created' in the database: ",
          error
        );
        return NextResponse.json(
          { message: "Failed to store event 'user.created' in the database" },
          { status: 500 }
        );
      }
    } else if (eventType === "user.updated") {
      const {
        id,
        first_name,
        last_name,
        username,
        email_addresses,
        image_url,
        public_metadata,
      } = evt.data;

      if (!first_name || !last_name || !username) {
        return NextResponse.json(
          {
            message: "Missing required fileds",
          },
          { status: 400 }
        );
      }

      let role: UserRole = "USER";

      if (public_metadata && public_metadata.role) {
        const metadataRole = public_metadata.role as string;
        if (metadataRole === "MODERATOR") {
          role = "MODERATOR";
        } else if (metadataRole === "SUPERUSER") {
          role = "SUPERUSER";
        }
      }

      try {
        const updatedUser = await db.user.update({
          where: {
            clerk_id: id,
          },
          data: {
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email_addresses[0].email_address,
            profile_pict: image_url,
            role: role,
          },
        });

        return NextResponse.json({ updatedUser }, { status: 200 });
      } catch (error) {
        console.error(
          "Error: Failed to update user on 'user.updated' event: ",
          error
        );
        return NextResponse.json(
          { message: "Failed to update user on 'user.updated' event" },
          { status: 500 }
        );
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
