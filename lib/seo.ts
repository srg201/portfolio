import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

/**
 * Адрес сайта для абсолютных ссылок (canonical, hreflang, OG).
 * NEXT_PUBLIC_SITE_URL задаётся вручную, когда появится домен; до этого
 * на Vercel берётся адрес продакшна, локально localhost.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

/**
 * canonical и hreflang для страницы на всех языках.
 * path без локали: "" для главной, "/work" и т. д.
 * x-default ведёт на английскую версию (fallback-язык).
 */
export function localeAlternates(
  locale: AppLocale,
  path = "",
): Metadata["alternates"] {
  const href = (target: string) => `/${target}${path}`;
  return {
    canonical: href(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, href(l)])),
      "x-default": href(routing.defaultLocale),
    },
  };
}
