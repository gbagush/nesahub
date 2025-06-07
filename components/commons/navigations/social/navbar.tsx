"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@heroui/button";

export const Navbar = ({
  title,
  isBordered = true,
  className,
  endContent,
}: {
  title: string;
  isBordered?: boolean;
  className?: string;
  endContent?: React.ReactNode;
}) => {
  const router = useRouter();

  return (
    <div
      className={`sticky top-0 z-50 flex items-start p-4 backdrop-blur-md ${!endContent && "h-16 px-4"} ${isBordered && "border-y border-foreground-100"} ${className}`}
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 -mt-1.5">
        <Button
          className="text-foreground"
          variant="light"
          radius="full"
          isIconOnly
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>

        <span className="text-lg font-bold">{title}</span>

        {endContent && <div className="col-start-2">{endContent}</div>}
      </div>
    </div>
  );
};
