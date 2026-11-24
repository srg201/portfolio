import { getDirection, type AppLocale } from "@/i18n/routing";

/**
 * Атрибуты для текстов проекта, когда их язык не совпадает с языком
 * страницы (перевода нет, показан английский): lang для скринридеров
 * и dir для RTL-страниц, чтобы пунктуация не уезжала.
 */
export function contentAttrs(
  locale: string,
  textLang: string = "en",
): { lang?: string; dir?: "ltr" | "rtl" } {
  if (textLang === locale) return {};
  const pageDir = getDirection(locale as AppLocale);
  const textDir = getDirection(textLang as AppLocale);
  return pageDir === textDir ? { lang: textLang } : { lang: textLang, dir: textDir };
}
