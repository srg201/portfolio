import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import { getProjects } from "@/lib/content";
import { services } from "@/lib/mock/services";
import { cn } from "@/lib/utils";
import { ServicesList, type ServiceItem } from "./services-list";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Услуги: аккордеон, у каждой услуги пример из портфолио.
 * С мышью пример летит за курсором, иначе показан внутри раскрытой услуги.
 */
export async function Services() {
  const t = await getTranslations("Services");
  const projects = await getProjects((await getLocale()) as Locale);

  const items: ServiceItem[] = services.map((service, index) => {
    const project = projects.find((p) => p.slug === service.example);
    const isSelf = service.example === "portfolio";
    const exampleName = isSelf ? t("thisSite") : project?.title;
    const cover = isSelf ? "/work/portfolio/cover.jpg" : project?.cover.src;
    return {
      slug: service.slug,
      number: String(index + 1).padStart(2, "0"),
      title: t(`items.${service.slug}.title`),
      description: t(`items.${service.slug}.description`),
      stack: service.stack,
      example:
        exampleName && cover
          ? {
              cover,
              label: `${t("example")}: ${exampleName}`,
            }
          : null,
    };
  });

  return (
    <section
      aria-labelledby="services-title"
      className="px-4 py-24 min-[400px]:px-5 sm:px-6 md:px-10 md:py-40"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:gap-20">
        <header className="grid gap-6 md:grid-cols-2 md:items-end">
          <div className="flex flex-col gap-6">
            <p aria-hidden className={cn(meta, "text-brand")}>
              ( {t("label")} )
            </p>
            <h2
              id="services-title"
              className="text-5xl leading-[0.9] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-md text-base text-pretty text-muted-foreground sm:text-lg md:justify-self-end">
            {t("intro")}
          </p>
        </header>

        <ServicesList items={items} />
      </div>
    </section>
  );
}
