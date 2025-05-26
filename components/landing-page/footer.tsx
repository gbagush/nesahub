import Image from "next/image";
import Link from "next/link";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import NesahubLogo from "@/public/logo.svg";

export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden mt-16">
      <div className="absolute inset-8 h-full z-0">
        <div className="h-full flex items-center justify-center">
          <TextHoverEffect text="NESAHUB" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 mb-6 group pointer-events-auto"
            >
              <div className="relative">
                <Image
                  src={NesahubLogo}
                  alt="Nesahub Logo"
                  width={32}
                  height={32}
                  className="invert dark:invert-0 transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                Nesahub
              </span>
            </Link>

            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md pointer-events-auto">
              Modern social media platform for sharing, connecting, and
              discovering content in real time.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 pointer-events-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                © {new Date().getFullYear()} Nesahub. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span>Made with ❤️ for innovation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
