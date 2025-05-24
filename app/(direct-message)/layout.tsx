import MobileDock from "@/components/commons/navigations/social/mobile-dock";
import { Sidebar } from "@/components/commons/navigations/social/sidebar";
import { ChatList } from "@/components/messages/chat-list";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto lg:px-2">
      <aside className="w-1/5 hidden lg:block">
        <Sidebar />
      </aside>

      <ChatList />

      <div className="flex flex-col w-full lg:w-2/5 lg:border-x lg:border-foreground-100 pb-[72px] lg:pb-0">
        {children}
      </div>
      <MobileDock />
    </div>
  );
}
