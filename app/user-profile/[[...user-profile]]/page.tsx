"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function UserProfilePage() {
  const { theme } = useTheme();

  return (
    <UserProfile
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    />
  );
}
