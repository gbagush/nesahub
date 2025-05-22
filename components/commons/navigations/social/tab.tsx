"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

export const NavTab = ({
  items,
  isSticky = false,
}: {
  items: { label: string; href: string }[];
  isSticky?: boolean;
}) => {
  const pathname = usePathname();

  return (
    <div
      className={`flex w-full h-16 border-b border-foreground-100 ${isSticky ? "sticky top-0 z-50 backdrop-blur-md" : ""}`}
    >
      {items.map((item, index) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={index}
            href={item.href}
            className="relative flex w-full items-center justify-center hover:bg-foreground-50"
          >
            <span className="text-sm">{item.label}</span>
            {isActive && (
              <div className="absolute bottom-0.5 h-1 w-1/4 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
};
