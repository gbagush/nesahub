"use client";
import Image from "next/image";

import { SignIn, SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

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
  DropdownSection,
  DropdownItem,
} from "@heroui/dropdown";
import { User } from "@heroui/user";

import Logo from "@/public/logo.svg";
import { Button } from "@heroui/button";

export const Sidebar = () => {
  const { theme } = useTheme();

  return (
    <nav className="hidden fixed md:flex md:flex-col p-4 h-screen overflow-y-auto">
      <Image src={Logo} alt="Logo" className="w-12 h-12 mb-4" />

      <div className="flex flex-col gap-2 w-full">
        <SidebarItem icon={<Home size={24} />} title="Home" isActive={true} />
        <SidebarItem icon={<Search size={24} />} title="Explore" />
        <SidebarItem icon={<Bookmark size={24} />} title="Saved Posts" />
        <SidebarItem icon={<UserIcon size={24} />} title="Profile" />
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
  title: String;
  href?: String;
  isActive?: boolean;
}) => {
  return (
    <div
      className={`flex items-center py-2 gap-4 rounded-lg hover:bg-background ${isActive && "bg-background"}`}
    >
      {icon}
      <span className="text-lg">{title}</span>
    </div>
  );
};

export const SidebarUserProfile = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openUserProfile, signOut, openSignIn } = useClerk();
  const { theme, setTheme } = useTheme();

  const onChangeTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return (
    <div className="mt-auto">
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
