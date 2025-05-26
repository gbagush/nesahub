"use client";

import { AISection } from "@/components/landing-page/ai-section";
import { FeaturesSection } from "@/components/landing-page/features-section";
import { Footer } from "@/components/landing-page/footer";
import { HeroSection } from "@/components/landing-page/hero-section";
import { LandingPageNavbar } from "@/components/landing-page/navbar";

export default function LandingPage() {
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
