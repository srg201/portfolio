import { ArrowUp, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Magnetic } from "@/components/motion/magnetic";
import { Link } from "@/i18n/navigation";
import { getCurrentYear, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FooterMotion } from "./footer-motion";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Финальный CTA и футер, общий для всех страниц (layout).
 * Карточка со скруглённым верхом: над ней виден туман, при входе
 * содержимое выезжает шторкой (footer-motion.tsx).
 * Почта показывается, только если задана в lib/site.ts.
 */
export async function Footer() {
  const t = await getTranslations("Footer");
  const common = await getTranslations("Common");
  const year = await getCurrentYear();

  return (
    <footer
      aria-labelledby="footer-title"
      className="relative z-10 mt-auto overflow-hidden rounded-t-[2rem] border-t bg-background sm:rounded-t-[3rem]"
    >
      <FooterMotion>
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pt-20 pb-32 min-[400px]:px-5 sm:px-6 sm:pt-28 md:gap-24 md:px-10 md:pt-36">
          <div className="flex flex-col gap-10">
            <p data-footer-reveal aria-hidden className={cn(meta, "text-brand")}>
              ( {t("label")} )
            </p>
            <h2
              id="footer-title"
              data-footer-title
              className="text-[clamp(2.75rem,8.5vw,9.5rem)] leading-[0.88] font-semibold tracking-[-0.05em] text-balance"
            >
              {t("title")}
            </h2>

            <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
              <p
                data-footer-reveal
                className="max-w-md text-base text-pretty text-muted-foreground sm:text-lg"
              >
                {t("text")}
              </p>
              <div data-footer-reveal className="self-start sm:self-auto">
                <Magnetic strength={0.4}>
                  <Link
                    href="/contact"
                    className="group/cta flex size-36 flex-col items-center justify-center gap-2 rounded-full bg-primary p-5 text-center text-base leading-tight font-medium text-primary-foreground transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 sm:size-44 sm:text-lg"
                  >
                    <span
                      data-magnetic-inner
                      className="grid size-9 place-items-center rounded-full bg-primary-foreground text-primary transition-transform duration-500 group-hover/cta:rotate-45 rtl:-scale-x-100"
                    >
                      <ArrowUpRight aria-hidden className="size-4" />
                    </span>
                    {t("cta")}
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>

          <div className="grid gap-10 border-t pt-10 sm:grid-cols-3">
            {site.email && (
              <div className="flex flex-col gap-3">
                <p className={cn(meta, "text-muted-foreground")}>
                  {t("email")}
                </p>
                <a
                  href={`mailto:${site.email}`}
                  className="w-fit text-lg underline-offset-4 hover:text-brand hover:underline"
                >
                  {site.email}
                </a>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <p className={cn(meta, "text-muted-foreground")}>
                {t("elsewhere")}
              </p>
              <ul className="flex flex-col gap-1.5">
                {site.socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/social inline-flex items-center gap-1.5 text-lg underline-offset-4 hover:text-brand hover:underline"
                    >
                      {social.name}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform group-hover/social:-translate-y-0.5 group-hover/social:translate-x-0.5 rtl:-scale-x-100"
                      />
                      <span className="sr-only">({t("newTab")})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:col-start-3 sm:items-end">
              <a
                href="#main"
                className={cn(
                  meta,
                  "group/top inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <ArrowUp
                  aria-hidden
                  className="size-3.5 transition-transform group-hover/top:-translate-y-0.5"
                />
                {t("backToTop")}
              </a>
            </div>
          </div>

          <div
            className={cn(
              meta,
              "flex flex-col gap-2 text-muted-foreground sm:flex-row sm:justify-between",
            )}
          >
            <p>
              © <span className="tabular-nums">{year}</span> {common("name")}
            </p>
            <p>{common("role")}</p>
          </div>
        </div>
      </FooterMotion>
    </footer>
  );
}
