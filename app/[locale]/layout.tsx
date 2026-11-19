import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { LocaleStage } from "@/components/motion/locale-stage";
import { Providers } from "@/components/providers";
import { getDirection, routing } from "@/i18n/routing";
import "../globals.css";

// Шрифты временные: типографика и Noto для CJK/Devanagari/Arabic подключаются на этапе 2
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("title"), template: `%s — ${t("title")}` },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations("Common");

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <Providers direction={getDirection(locale)}>
            <LocaleStage>{children}</LocaleStage>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
