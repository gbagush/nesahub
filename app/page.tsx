import Logo from "@/public/logo.svg";
import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto px-8 min-h-screen justify-center">
      {/* Logo and content container with responsive layout */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Logo section - centered on mobile, left-aligned on desktop */}
        <div className="flex items-center justify-center mb-8 lg:mb-0">
          <Image
            src={Logo}
            alt="Logo"
            height={180}
            className="w-auto h-auto max-h-52"
          />
        </div>

        {/* Content section - full width on mobile */}
        <div className="flex flex-col w-full lg:w-auto">
          <h1 className="font-black text-4xl md:text-5xl mb-8 md:mb-12 text-center lg:text-left">
            Happening now
          </h1>

          <div className="mb-8">
            <h4 className="font-bold text-xl md:text-2xl mb-4 text-center lg:text-left">
              Join today.
            </h4>
            <Button
              as={Link}
              href="/sign-up"
              color="primary"
              variant="solid"
              radius="full"
              className="w-full md:w-2/3 mx-auto lg:mx-0"
            >
              Sign Up
            </Button>
          </div>

          <div>
            <p className="font-semibold text-base md:text-lg mb-4 text-center lg:text-left">
              Already have an account?
            </p>
            <Button
              as={Link}
              href="/sign-in"
              color="primary"
              variant="bordered"
              radius="full"
              className="w-full md:w-2/3 mx-auto lg:mx-0"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
