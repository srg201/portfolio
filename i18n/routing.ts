import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
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
