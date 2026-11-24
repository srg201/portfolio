import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { PageIntro } from "@/components/sections/page-intro";
import { Process } from "@/components/sections/process";
import { TechStack } from "@/components/sections/tech-stack";
import { routing } from "@/i18n/routing";
import { getCareerStats } from "@/lib/career";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";
const VALUES = ["speed", "craft", "ownership"] as const;

async function currentLocale() {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const t = await getTranslations("About");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/about"),
  };
}

/**
 * Обо мне: вводная, история и цифры карьеры (lib/career.ts), что важно
 * в работе, затем стек и процесс с главной. Фото, таймлайн и CV появятся,
 * когда будут материалы.
 */
export default async function AboutPage() {
  await currentLocale();
  const t = await getTranslations("About");
  const format = await getFormatter();
  const { years, startYear, projects } = await getCareerStats();
  const github = site.socials.find((social) => social.name === "GitHub");
  const footer = await getTranslations("Footer");

  const stats = [
    { value: `${format.number(years)}+`, label: t("statYears") },
    { value: `${format.number(projects)}+`, label: t("statProjects") },
    // Год без группировки разрядов: «2020», а не «2 020»
    { value: String(startYear), label: t("statSince") },
  ];

  return (
    <main id="main" className="flex flex-1 flex-col">
      <div className="flex flex-col gap-16 px-4 pt-20 pb-24 min-[400px]:px-5 sm:px-6 md:gap-24 md:px-10 md:pt-28 md:pb-32">
        <PageIntro label={t("label")} title={t("title")} intro={t("lead")} />

        <Reveal className="grid gap-12 border-t pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <p
            data-reveal-item
            className="text-2xl leading-snug font-light tracking-[-0.02em] text-pretty sm:text-3xl lg:text-4xl"
          >
            {t("story", { year: String(startYear), count: String(projects) })}
          </p>
          <dl className="grid grid-cols-3 gap-6 self-end">
            {stats.map((stat) => (
              <div key={stat.label} data-reveal-item className="flex flex-col gap-2">
                <dt className={cn(meta, "order-2 text-muted-foreground")}>{stat.label}</dt>
                <dd
                  dir="ltr"
                  className="order-1 text-[clamp(2.5rem,6vw,5rem)] leading-none font-light tracking-[-0.04em] tabular-nums rtl:text-end"
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="flex flex-col gap-10">
          <h2
            data-reveal-item
            className="text-4xl leading-none font-light tracking-[-0.04em] sm:text-5xl"
          >
            {t("valuesTitle")}
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-3">
            {VALUES.map((key, index) => (
              <li key={key} data-reveal-item className="flex flex-col gap-4 bg-background p-6 md:p-8">
                <span dir="ltr" className={cn(meta, "text-brand tabular-nums")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl tracking-[-0.02em]">{t(`values.${key}.title`)}</h3>
                <p className="text-pretty text-muted-foreground">{t(`values.${key}.text`)}</p>
              </li>
            ))}
          </ul>
          {github && (
            <a
              data-reveal-item
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                meta,
                "group/gh inline-flex h-12 w-fit items-center gap-3 rounded-full border border-foreground/30 ps-5 pe-1.5 transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
              )}
            >
              {t("code")}
              <span className="sr-only"> ({footer("newTab")})</span>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover/gh:rotate-45 rtl:-scale-x-100"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          )}
        </Reveal>
      </div>

      <TechStack />
      <Process />
    </main>
  );
}
