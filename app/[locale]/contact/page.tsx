import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Quiz } from "@/components/contact/quiz";
import { PageIntro } from "@/components/sections/page-intro";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

async function currentLocale() {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const t = await getTranslations("Contact");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/contact"),
  };
}

/**
 * Контакты: квиз «Оценить проект» и прямые контакты.
 * Отправка включается, когда заданы GMAIL_USER_NAME и GMAIL_APP_PASSWORD
 * (заявка приходит письмом на этот Gmail). Без них квиз открывает письмо
 * с ответами на публичный email, а если нет и его, честно говорит,
 * что заявки не подключены.
 */
export default async function ContactPage() {
  await currentLocale();
  const t = await getTranslations("Contact");
  const footer = await getTranslations("Footer");
  const enabled = Boolean(
    process.env.GMAIL_USER_NAME && process.env.GMAIL_APP_PASSWORD,
  );

  return (
    <main
      id="main"
      className="flex flex-1 flex-col gap-16 px-4 pt-20 pb-32 min-[400px]:px-5 sm:px-6 md:gap-20 md:px-10 md:pt-28"
    >
      <PageIntro label={t("label")} title={t("title")} intro={t("intro")} />

      <div className="grid gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-20">
        <Quiz enabled={enabled} email={site.email} />

        <aside className="flex flex-col gap-6 lg:border-s lg:ps-10">
          <p className={cn(meta, "text-muted-foreground")}>{t("elsewhere")}</p>
          {!enabled && !site.email && (
            <p className="text-pretty text-muted-foreground">{t("unavailable")}</p>
          )}
          <ul className="flex flex-col gap-3">
            {site.email && (
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-2xl tracking-[-0.02em] break-all transition-colors hover:text-brand sm:text-3xl"
                >
                  {site.email}
                </a>
              </li>
            )}
            {site.socials.map((social) => (
              <li key={social.url}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/s inline-flex items-center gap-2 text-2xl tracking-[-0.02em] transition-colors hover:text-brand sm:text-3xl"
                >
                  {social.name}
                  <span className="sr-only"> ({footer("newTab")})</span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 transition-transform duration-500 group-hover/s:rotate-45 rtl:-scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
