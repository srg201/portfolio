import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NotFoundLog } from "@/components/sections/not-found-log";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * 404: «страница ещё не задеплоена». Крупный код, псевдо-лог деплоя,
 * который падает с ошибкой, и ссылки, куда пойти дальше.
 */
export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const log = await getTranslations("NotFoundLog");
  const nav = await getTranslations("Nav");
  const links = [
    { href: "/", label: nav("home") },
    { href: "/work", label: nav("work") },
    { href: "/contact", label: nav("contact") },
  ] as const;

  return (
    <main
      id="main"
      className="flex flex-1 flex-col justify-center gap-10 px-4 pt-20 pb-32 min-[400px]:px-5 sm:px-6 md:px-10"
    >
      <div className="flex flex-col gap-4">
        <p aria-hidden className={cn(meta, "text-brand")}>
          ( 404 )
        </p>
        <h1 className="text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] font-light tracking-[-0.05em] text-balance">
          {t("title")}
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">{t("description")}</p>
      </div>

      <div className="max-w-2xl">
        <NotFoundLog
          path="/404"
          lines={{ build: log("build"), deploy: log("deploy"), error: log("error") }}
        >
          <div className="flex flex-col gap-4">
            <p data-log-after className={cn(meta, "text-muted-foreground")}>
              {log("hint")}
            </p>
            <ul className="flex flex-wrap gap-3">
              {links.map((link) => (
                <li key={link.href} data-log-after>
                  <Link
                    href={link.href}
                    className={cn(
                      meta,
                      "group/l inline-flex h-12 items-center gap-3 rounded-full border border-foreground/30 ps-5 pe-1.5 transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover/l:rotate-45 rtl:-scale-x-100"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </NotFoundLog>
      </div>
    </main>
  );
}
