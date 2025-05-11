"use client";

import { Home, TrendingUp } from "lucide-react";

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
      className={`flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-background ${isActive && "bg-background"}`}
    >
      {icon}
      <span>{title}</span>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <nav className="hidden md:block md:mt-0 p-4 h-screen overflow-y-auto">
      <nav className="flex flex-col gap-2">
        <SidebarItem icon={<Home size={20} />} title="Home" isActive={true} />
        <SidebarItem icon={<TrendingUp size={20} />} title="Trending" />
      </nav>
    </nav>
  );
};
