"use client";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { Input } from "@heroui/input";
import { PostCard } from "@/components/commons/post-card";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 px-8">
      <PostCard />
    </section>
  );
}
