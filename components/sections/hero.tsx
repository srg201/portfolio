import { ArrowUpRight, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { HeroMotion } from "./hero-motion";

/** Иероглифы и хангыль заметно шире латиницы и кириллицы */
const WIDE_SCRIPT = /[぀-ヿ㐀-鿿가-힯]/;

/**
 * Размер имени: самая длинная строка занимает ширину контейнера
 * (100cqi / (символов × средняя ширина символа в em)), но весь hero
 * должен поместиться по высоте: ~24rem уходит на подписи, CTA и Dock.
 */
function nameFontSize(lines: string[]) {
  const longest = Math.max(...lines.map((line) => [...line].length));
  const charWidth = lines.some((line) => WIDE_SCRIPT.test(line)) ? 1 : 0.66;
  const byWidth = `100cqi / ${(longest * charWidth).toFixed(2)}`;
  const byHeight = `(100svh - 24rem) / ${(lines.length * 0.84).toFixed(2)}`;
  return `max(2.5rem, min(calc(${byWidth}), calc(${byHeight}), 15rem))`;
}

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

export async function Hero() {
  const t = await getTranslations("Hero");
  const common = await getTranslations("Common");

  const name = common("name");
  const lines = name.split(/[\s·・]+/).filter(Boolean);
  const words = t.raw("words") as string[];

  return (
    <section
      aria-labelledby="hero-title"
      className="@container relative isolate flex min-h-svh flex-col px-4 pt-5 pb-28 min-[400px]:px-5 sm:px-6 sm:pb-32 md:px-10 md:pt-8"
    >
      <HeroBackdrop />

      <HeroMotion words={words}>
        {/* Верхняя строка: кто и для кого + статус */}
        <div
          className={cn(
            meta,
            "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
          )}
        >
          <p data-reveal className="leading-relaxed">
            <span className="block">{common("role")}</span>
            <span className="block text-muted-foreground">{t("tagline")}</span>
          </p>
          <p
            data-reveal
            className="flex shrink-0 items-center gap-2 leading-relaxed text-muted-foreground"
          >
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            {t("available")}
          </p>
        </div>

        {/* Имя на всю ширину */}
        <div className="flex flex-1 flex-col justify-center py-10 md:py-8">
          {/* Меняющееся слово: перебор символов в hero-motion.tsx */}
          <p
            data-reveal
            aria-hidden
            className={cn(meta, "mb-4 text-brand sm:mb-6")}
          >
            ( <span data-hero-word>{words[0]}</span> )
          </p>
          <h1
            id="hero-title"
            data-hero-name
            className="flex flex-col leading-[0.84] font-semibold tracking-[-0.045em] uppercase"
            style={{ fontSize: nameFontSize(lines) }}
          >
            {lines.map((line, index) => (
              <span
                key={line}
                // Чётные строки прижаты к концу: диагональная композиция
                className={cn("block", index % 2 === 1 && "text-end")}
              >
                {line}
              </span>
            ))}
          </h1>
        </div>

        {/* Нижняя строка: манифест, шоурил, CTA */}
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
          <p
            data-reveal
            className="max-w-sm text-base text-pretty text-muted-foreground sm:text-lg"
          >
            {t("manifesto")}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:contents">
            <ReelPreview label={t("showreel")} status={t("soon")} />

            <div data-reveal className="flex lg:justify-end">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group/cta h-12 w-full justify-between gap-3 rounded-full ps-6 pe-1.5 text-base sm:w-auto",
                )}
              >
                {t("cta")}
                <span className="grid size-9 place-items-center rounded-full bg-primary-foreground text-primary transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/cta:rotate-45 rtl:-scale-x-100">
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </HeroMotion>

      {/* Без JS анимация не запустится: показываем всё сразу */}
      <noscript>
        <style>
          {"[data-hero-name],[data-reveal]{visibility:visible!important}"}
        </style>
      </noscript>
    </section>
  );
}

/** Превью шоурила. Пока записей нет: живой градиент вместо видео */
function ReelPreview({ label, status }: { label: string; status: string }) {
  return (
    <div
      data-reveal
      className="flex items-center gap-3 self-start rounded-full border bg-background/60 p-1.5 pe-5 backdrop-blur sm:self-auto lg:justify-self-center"
    >
      <div
        aria-hidden
        className="relative grid h-11 w-18 place-items-center overflow-hidden rounded-full bg-muted"
      >
        <div className="hero-reel-placeholder absolute inset-[-50%]" />
        <Play className="relative size-4 fill-current text-background" />
      </div>
      <p className={cn(meta, "leading-relaxed")}>
        <span className="block">{label}</span>
        <span className="block text-muted-foreground">{status}</span>
      </p>
    </div>
  );
}

/** Фон: сетка точек и мягкое свечение фирменного цвета. WebGL-туман заменит его на шаге 4 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="hero-dots absolute inset-0" />
      <div className="absolute -top-1/3 -end-1/4 size-[70vmax] rounded-full bg-brand/15 blur-[120px] dark:bg-brand/20" />
      <div className="absolute -bottom-1/2 -start-1/4 size-[50vmax] rounded-full bg-chart-3/10 blur-[120px]" />
    </div>
  );
}
