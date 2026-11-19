import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { FeaturedWork } from "@/components/sections/featured-work";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { TechStack } from "@/components/sections/tech-stack";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return { alternates: localeAlternates(locale) };
}

export default function HomePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />
      <Stats />
      <FeaturedWork />
      <Services />
      <TechStack />
      <Process />
    </main>
  );
}
