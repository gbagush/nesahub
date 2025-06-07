"use client";

import Link from "next/link";
import Image from "next/image";

import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { Button } from "@heroui/button";
import {
  Bell,
  Bookmark,
  Home,
  LogOut,
  Mail,
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

  const path = usePathname();

  const menus = [
    {
      title: "Home",
      icon: <Home size={24} strokeWidth={path.startsWith("/home") ? 3 : 2} />,
      href: "/home",
    },
    {
      title: "Explore",
      icon: (
        <Search size={24} strokeWidth={path.startsWith("/search") ? 3 : 2} />
      ),
      href: "/search",
    },
    {
      title: "Notifications",
      icon: (
        <Bell
          size={24}
          fill={path.startsWith("/notifications") ? "currentColor" : "none"}
        />
      ),
      href: "/notifications",
    },
    {
      title: "Messages",
      icon: (
        <Mail size={24} strokeWidth={path.startsWith("/messages") ? 3 : 2} />
      ),
      href: "/messages",
    },
    {
      title: "Saved",
      icon: (
        <Bookmark
          size={24}
          fill={path.startsWith("/saved") ? "currentColor" : "none"}
        />
      ),
      href: "/saved",
    },
  ];

  return (
    <nav className="hidden fixed md:flex md:flex-col p-4 h-screen overflow-y-auto">
      <Image
        alt="Logo"
        className="w-8 h-8 mb-4 ml-3 invert dark:invert-0"
        src={Logo}
      />

      <div className="flex flex-col gap-2 w-full">
        {menus.map((menu) => (
          <SidebarItem
            key={menu.title}
            icon={menu.icon}
            title={menu.title}
            href={menu.href}
            isActive={path.startsWith(menu.href)}
          />
        ))}
        {isSignedIn && (
          <SidebarItem
            icon={
              <UserIcon
                size={24}
                strokeWidth={path.startsWith(`/user/${user.username}`) ? 3 : 2}
              />
            }
            title="Profile"
            href={`/user/${user.username}`}
            isActive={path.startsWith(`/user/${user.username}`)}
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
      className={`flex items-center py-2 px-4 gap-4 rounded-full hover:bg-foreground-100 ${isActive && "font-semibold"}`}
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
