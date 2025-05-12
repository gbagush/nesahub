import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { Button } from "@heroui/button";

export const SocialNav = ({ title }: { title: String }) => {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 flex items-center p-4 h-16 backdrop-blur-md border-y border-foreground-100">
      <Button
        className="flex items-center gap-2 text-foreground"
        variant="light"
        radius="full"
        isIconOnly
        onPress={() => router.back()}
      >
        <ArrowLeft size={20} />
      </Button>
      <span className="ml-2 text-lg font-bold">{title}</span>
    </div>
  );
};
