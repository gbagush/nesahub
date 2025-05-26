"use client";
import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeSwitch } from "../theme-switch";

export function LandingPageNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();
  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <NavbarButton
            variant="secondary"
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </NavbarButton>
          <NavbarButton
            variant="primary"
            onClick={() => router.push("/sign-up")}
          >
            Join now
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex w-full flex-col gap-4">
            <NavbarButton
              onClick={() => router.push("/sign-in")}
              variant="primary"
              className="w-full"
            >
              Sign in
            </NavbarButton>
            <NavbarButton
              onClick={() => router.push("/sign-up")}
              variant="primary"
              className="w-full"
            >
              Sign up
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
