import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
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
  ],
  defaultLocale: "en",
  localePrefix: "always",
  // Ручной выбор языка важнее Accept-Language: храним его год
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];

const rtlLocales: ReadonlySet<AppLocale> = new Set(["ar"]);

export function getDirection(locale: AppLocale): "ltr" | "rtl" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
