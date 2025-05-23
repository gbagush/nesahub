"use client";

import Link from "next/link";
import Image from "next/image";

import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { Button } from "@heroui/button";
import {
  Bookmark,
  Home,
  LogOut,
  Search,
  Settings,
  SunMoon,
  User as UserIcon,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { User } from "@heroui/user";

import Logo from "@/public/logo.svg";
import { dark } from "@clerk/themes";

export const Sidebar = () => {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="hidden fixed md:flex md:flex-col p-4 h-screen overflow-y-auto">
      <Image
        src={Logo}
        alt="Logo"
        className="w-8 h-8 mb-4 ml-3 invert dark:invert-0"
      />

      <div className="flex flex-col gap-2 w-full">
        <SidebarItem icon={<Home size={24} />} title="Home" href="/home" />
        <SidebarItem
          icon={<Search size={24} />}
          title="Explore"
          href="/search"
        />
        <SidebarItem
          icon={<Bookmark size={24} />}
          title="Saved Posts"
          href="/saved"
        />
        {isSignedIn && (
          <SidebarItem
            icon={<UserIcon size={24} />}
            title="Profile"
            href={`/user/${user.username}`}
          />
        )}
      </div>

      <SidebarUserProfile />
    </nav>
  );
};

export const SidebarItem = ({
  icon,
  title,
  href,
  isActive = false,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  isActive?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center py-2 px-4 gap-4 rounded-full hover:bg-foreground-100 ${isActive && ""}`}
    >
      {icon}
      <span className="text-lg">{title}</span>
    </Link>
  );
};

export const SidebarUserProfile = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const onChangeTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return (
    <div className="mt-auto px-4">
      {isSignedIn && isLoaded ? (
        <Dropdown placement="right">
          <DropdownTrigger>
            <User
              avatarProps={{
                src: user.imageUrl,
              }}
              name={user.fullName}
              description={`@${user?.username}`}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Auth Menu">
            <DropdownItem
              key="account"
              startContent={<Settings size={16} />}
              onPress={() =>
                openUserProfile({
                  appearance: {
                    baseTheme: theme === "dark" ? dark : undefined,
                  },
                })
              }
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
      ) : (
        <SignInButton>
          <Button className="w-full" variant="faded" radius="full">
            Sign in
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
