"use client";
import Link from "next/link";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bookmark,
  Home,
  LogOut,
  Search,
  Settings,
  SunMoon,
  User,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function MobileDock() {
  const { user } = useUser();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-background border-t border-foreground-100 h-16 px-4 lg:hidden">
      <Link href="/home" className="flex flex-col items-center gap-1">
        <Home className="w-5 h-5 " />
      </Link>
      <Link href="/search" className="flex flex-col items-center gap-1">
        <Search className="w-5 h-5 " />
      </Link>
      <Link href="/saved" className="flex flex-col items-center gap-1">
        <Bookmark className="w-5 h-5 " />
      </Link>
      <SidebarUserProfile />
    </div>
  );
}

const SidebarUserProfile = () => {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const router = useRouter();

  const onChangeTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar src={user?.imageUrl} size="sm" />
      </DropdownTrigger>
      <DropdownMenu aria-label="Auth Menu">
        <DropdownItem
          key="profile"
          startContent={<User size={16} />}
          onClick={() => router.push(`/user/${user?.username}`)}
        >
          Profile
        </DropdownItem>
        <DropdownItem
          key="account"
          startContent={<Settings size={16} />}
          onPress={() => openUserProfile()}
        >
          Account
        </DropdownItem>
        <DropdownItem
          key="change-theme"
          startContent={<SunMoon size={16} />}
          onClick={onChangeTheme}
        >
          Change theme
        </DropdownItem>
        <DropdownItem
          key="signout"
          color="danger"
          startContent={<LogOut size={16} />}
          onPress={() => signOut()}
        >
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
