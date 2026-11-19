import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // `locale` задан, только если его явно передали, например getTranslations({ locale })
  let resolved = locale;

  if (!resolved) {
    const segment = await rootLocale();
    if (!hasLocale(routing.locales, segment)) notFound();
    resolved = segment;
  }

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
