import { Navbar } from "@/components/navigations/social/navbar";
import { Sidebar } from "@/components/navigations/social/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute top-0 z-[-2] h-screen w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <Navbar />

      <div className="flex min-h-screen">
        <aside className="hidden md:block md:w-1/4 lg:w-1/6 border-r border-foreground-200 h-screen overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/6 p-4">{children}</main>

        <aside className="hidden lg:block lg:w-1/6 border-l border-foreground-200 h-screen overflow-y-auto p-4">
          <h2 className="font-bold text-lg mb-4">Trending</h2>
          <ul className="space-y-2">
            <li className="p-2 hover:bg-foreground-100 rounded-md">Post 1</li>
            <li className="p-2 hover:bg-foreground-100 rounded-md">Post 2</li>
            <li className="p-2 hover:bg-foreground-100 rounded-md">Post 3</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
