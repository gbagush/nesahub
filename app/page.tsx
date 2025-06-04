"use client";
import { useUser } from "@clerk/nextjs";

import { AISection } from "@/components/landing-page/ai-section";
import { FeaturesSection } from "@/components/landing-page/features-section";
import { Footer } from "@/components/landing-page/footer";
import { HeroSection } from "@/components/landing-page/hero-section";
import { LandingPageNavbar } from "@/components/landing-page/navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    console.log("User data:", user);

    if (user.isSignedIn) {
      router.push("/home");
    }
  }, [user]);

  return (
    <>
      <section className="flex flex-col mx-auto items-center justify-center gap-4">
        <LandingPageNavbar />
        <HeroSection />
        <AISection />
        <FeaturesSection />
      </section>
      <Footer />
    </>
  );
}
