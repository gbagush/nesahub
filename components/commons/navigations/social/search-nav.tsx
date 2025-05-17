"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const SearchNav = ({
  query: initialQuery = "",
  className,
  hideBackButton = false,
}: {
  query?: string;
  className?: string;
  border?: boolean;

  hideBackButton?: boolean;
}) => {
  const [query, setQuery] = useState(initialQuery);

  const router = useRouter();

  return (
    <div
      className={`sticky top-0 z-10 flex items-center h-16 backdrop-blur-md ${className}`}
    >
      {!hideBackButton && (
        <Button
          className="flex items-center gap-2 text-foreground"
          variant="light"
          radius="full"
          isIconOnly
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} />
        </Button>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmedQuery = query.trim();
          if (trimmedQuery.startsWith("#") && trimmedQuery.length > 1) {
            const hashtag = trimmedQuery.slice(1);
            router.push(`/posts/hashtag/${encodeURIComponent(hashtag)}`);
          } else {
            router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
          }
        }}
        className="w-full"
      >
        <Input
          radius="full"
          variant="bordered"
          startContent={<Search size={16} />}
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          classNames={{
            inputWrapper: "border-1 border-foreground-100",
          }}
        />
      </form>
    </div>
  );
};
