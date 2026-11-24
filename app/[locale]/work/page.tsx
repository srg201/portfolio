import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/sections/page-intro";
import { WorkBrowser, type WorkItem } from "@/components/work/work-browser";
import { routing } from "@/i18n/routing";
import { projectCategories, publishedProjects } from "@/lib/mock/projects";
import { contentAttrs } from "@/lib/content-lang";
import { localeAlternates } from "@/lib/seo";

async function currentLocale() {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const t = await getTranslations("WorkPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/work"),
  };
}

/** Все опубликованные работы с фильтром и переключением вида */
export default async function WorkPage() {
  const locale = await currentLocale();
  const t = await getTranslations("WorkPage");
  const categories = Object.fromEntries(
    projectCategories.map((key) => [key, t(`categories.${key}`)]),
  ) as Record<(typeof projectCategories)[number], string>;

  const items: WorkItem[] = publishedProjects.map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    year: project.year,
    category: project.category,
    categoryLabel: categories[project.category],
    stack: project.stack,
    cover: `/work/${project.slug}/cover.jpg`,
    preview: `/work/${project.slug}/preview.mp4`,
  }));

  return (
    <main
      id="main"
      className="flex flex-1 flex-col gap-14 px-4 pt-20 pb-32 min-[400px]:px-5 sm:px-6 md:gap-20 md:px-10 md:pt-28"
    >
      <PageIntro label={t("label")} title={t("title")} intro={t("intro")} />
      <WorkBrowser
        items={items}
        content={contentAttrs(locale)}
        labels={{
          filter: t("filter"),
          all: t("all"),
          view: t("view"),
          grid: t("grid"),
          list: t("list"),
          projects: t("projects"),
          open: t("open"),
          categories,
        }}
      />
    </main>
  );
}
