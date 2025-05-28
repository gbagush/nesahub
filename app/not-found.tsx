import Link from "next/link";
import { Button } from "@heroui/button";
 
import MobileDock from "@/components/commons/navigations/social/mobile-dock";
import { Sidebar } from "@/components/commons/navigations/social/sidebar";
 
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto lg:px-2">
      <aside className="w-1/5 hidden lg:block">
        <Sidebar />
      </aside>
 
      <main className="flex flex-col items-center justify-center w-full lg:w-4/5 lg:border-x lg:border-foreground-100 pb-[72px] lg:pb-0 px-4">
        <div className="flex flex-col items-center text-center gap-6 py-24">
          <h1 className="text-2xl font-bold text-foreground">
            This page doesn&apos;t exist
          </h1>
          <p className="text-sm text-foreground-500 max-w-sm">
            It looks like you followed a broken link or entered a URL that
            doesn&apos;t exist on this site.
          </p>
          <Button
            as={Link}
            href="/home"
            color="primary"
            radius="full"
            className="px-6"
          >
            Back to home
          </Button>
        </div>
        <MobileDock />
      </main>
    </div>
  );
}
 