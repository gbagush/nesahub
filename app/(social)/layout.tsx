import MobileDock from "@/components/commons/navigations/social/mobile-dock";
import { SearchNav } from "@/components/commons/navigations/social/search-nav";
import { Sidebar } from "@/components/commons/navigations/social/sidebar";
import { WhoToFollow } from "@/components/commons/navigations/social/who-to-follow";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto lg:px-2">
      <aside className="w-1/5 hidden lg:block">
        <Sidebar />
      </aside>

      <div className="flex flex-col w-full lg:w-2/4 lg:border-x lg:border-foreground-100 pb-[72px] lg:pb-0">
        {children}

        <MobileDock />
      </div>

      <aside className="w-1/4 hidden lg:block pl-4">
        <SearchNav hideBackButton border={false} />

        <WhoToFollow />
      </aside>
    </div>
  );
}
