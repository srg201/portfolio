/**
 * Языки сайта. Отдельный модуль без зависимостей: его читают и next-intl
 * (routing.ts), и Sanity Studio (поля переводов).
 */
export const locales = [
  "en",
  "zh",
  "es",
  "hi",
  "ar",
  "pt",
  "ru",
  "fr",
  "de",
  "ja",
  "ko",
  "pl",
  "tr",
  "it",
  "uk",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Названия языков для админки */
export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  hi: "हिन्दी",
  ar: "العربية",
  pt: "Português",
  ru: "Русский",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  pl: "Polski",
  tr: "Türkçe",
  it: "Italiano",
  uk: "Українська",
};
