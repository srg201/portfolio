import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProjects } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/** Все страницы на всех языках, у каждой ссылки на остальные языки (hreflang) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects(routing.defaultLocale);
  const paths = [
    "",
    "/work",
    "/about",
    "/contact",
    ...projects.map((project) => `/work/${project.slug}`),
  ];
  const url = (locale: string, path: string) => new URL(`/${locale}${path}`, siteUrl).href;

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/work/") ? 0.7 : 0.8,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}
