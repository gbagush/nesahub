import { Sidebar } from "@/components/navigations/social/sidebar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { User } from "@heroui/user";
import { Search } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-7xl mx-auto px-4">
      <aside className="w-1/5 hidden lg:block">
        <Sidebar />
      </aside>

      <div className="flex flex-col w-full lg:w-2/4 border-x border-foreground-100">
        {children}
      </div>

      <aside className="w-1/4 hidden xl:block pl-4">
        <div className="sticky top-0 z-20 h-16 bg-background">
          <div className="flex items-center justify-center w-full h-full">
            <Input
              variant="bordered"
              radius="full"
              startContent={<Search size={16} />}
              placeholder="Search..."
              classNames={{
                inputWrapper: "border-1 border-foreground-100",
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-foreground-100">
          <h2 className="text-lg font-semibold mb-4">Who to follow</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <User
                avatarProps={{
                  src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                }}
                name="John Doe"
                description="@johndoe"
              />
              <Button size="sm" radius="full">
                Follow
              </Button>
            </li>
            <li className="flex items-center justify-between">
              <User
                avatarProps={{
                  src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                }}
                name="John Doe"
                description="@johndoe"
              />
              <Button size="sm" radius="full">
                Follow
              </Button>
            </li>
            <li className="flex items-center justify-between">
              <User
                avatarProps={{
                  src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                }}
                name="John Doe"
                description="@johndoe"
              />
              <Button size="sm" radius="full">
                Follow
              </Button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
