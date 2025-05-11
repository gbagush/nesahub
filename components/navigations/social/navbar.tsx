"use client";

import React from "react";
import Image from "next/image";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

import Logo from "@/public/logo.svg";
import { Plus } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isSignedIn, user, isLoaded } = useUser();

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <HeroUINavbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      height="5rem"
      isBordered={true}
      isBlurred={false}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Image src={Logo} height={48} width={48} alt="Unesa Logo" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            For You
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Following
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {isLoaded && !isSignedIn ? (
          <>
            <NavbarItem className="hidden lg:flex">
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            </NavbarItem>
            <NavbarItem>
              <SignUpButton>
                <Button as={Link} color="primary" href="#" variant="flat">
                  Sign Up
                </Button>
              </SignUpButton>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Button color="primary" variant="faded" radius="full" size="sm">
                <Plus size={20} /> Add Post
              </Button>
            </NavbarMenuItem>
            <UserButton />
          </>
        )}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <>
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full"
                color={
                  index === 2
                    ? "primary"
                    : index === menuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item}
              </Link>
            </NavbarMenuItem>
          </>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
