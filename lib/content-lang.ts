import { getDirection, type AppLocale } from "@/i18n/routing";

/**
 * Атрибуты для текстов проектов: они пока только на английском.
 * На других языках помечаем их lang="en" (скринридер читает правильно),
 * а на RTL-языках ещё и dir="ltr", чтобы пунктуация не уезжала.
 */
export function contentAttrs(locale: string): { lang?: string; dir?: "ltr" } {
  if (locale === "en") return {};
  return getDirection(locale as AppLocale) === "rtl"
    ? { lang: "en", dir: "ltr" }
    : { lang: "en" };
}
