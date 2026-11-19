import { ArrowUpRight, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/magnetic";
import { showreel } from "@/lib/showreel";
import { HeroMotion } from "./hero-motion";
import { ShowreelVideo } from "./showreel-video";

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

/** 22 → «0:22» */
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export async function Hero() {
  const t = await getTranslations("Hero");
  const common = await getTranslations("Common");

  const name = common("name");
  const lines = name.split(/[\s·・]+/).filter(Boolean);
  const words = t.raw("words") as string[];

  return (
    // Сцена: высота задаёт длину прокрутки, внутри липкий экран.
    // При скролле превью шоурила растёт до полного экрана (hero-motion.tsx).
    // Без анимаций (prefers-reduced-motion) это обычный hero и видео под ним.
    <section
      aria-labelledby="hero-title"
      data-hero-scene
      className="relative h-[260svh] motion-reduce:h-auto"
    >
      <HeroMotion words={words}>
        <div
          data-hero-stage
          className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible"
        >
          <div
            data-hero-content
            className="@container relative isolate flex h-full min-h-svh flex-col px-4 pt-5 pb-28 min-[400px]:px-5 sm:px-6 sm:pb-32 md:px-10 md:pt-8"
          >
            <HeroBackdrop />

            {/* Верхняя строка: кто и для кого + статус */}
            <div
              className={cn(
                meta,
                "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
              )}
            >
              <p data-reveal className="leading-relaxed">
                <span className="block">{common("role")}</span>
                <span className="block text-muted-foreground">
                  {t("tagline")}
                </span>
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
                data-depth="0.35"
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
                <ReelPreview
                  label={t("showreel")}
                  duration={formatDuration(showreel.duration)}
                />

                <div data-reveal className="flex lg:justify-end">
                  <Magnetic className="w-full sm:w-auto">
                    <Link
                      href="/contact"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "group/cta h-12 w-full justify-between gap-3 rounded-full ps-6 pe-1.5 text-base sm:w-auto",
                      )}
                    >
                      {t("cta")}
                      <span
                        data-magnetic-inner
                        className="grid size-9 place-items-center rounded-full bg-primary-foreground text-primary transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/cta:rotate-45 rtl:-scale-x-100"
                      >
                        <ArrowUpRight aria-hidden className="size-4" />
                      </span>
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>

          <ShowreelLayer
            label={t("showreel")}
            duration={formatDuration(showreel.duration)}
          />
        </div>
      </HeroMotion>

      {/* Без JS анимация не запустится: показываем всё сразу, слой шоурила прячем */}
      <noscript>
        <style>
          {
            "[data-hero-name],[data-reveal]{visibility:visible!important}[data-reel-layer]{display:none}"
          }
        </style>
      </noscript>
    </section>
  );
}

/**
 * Плашка шоурила. Миниатюра [data-reel-thumb] только задаёт место:
 * поверх неё лежит обрезанный слой с видео (ShowreelLayer), градиент виден,
 * пока видео не проявилось.
 */
function ReelPreview({ label, duration }: { label: string; duration: string }) {
  return (
    <div
      data-reveal
      className="flex items-center gap-3 self-start rounded-full border bg-background/60 p-1.5 pe-5 backdrop-blur sm:self-auto lg:justify-self-center"
    >
      <div
        aria-hidden
        data-reel-thumb
        className="relative grid h-11 w-18 place-items-center overflow-hidden rounded-full bg-muted"
      >
        <div className="hero-reel-placeholder absolute inset-[-50%]" />
        <Play className="relative size-4 fill-current text-background" />
      </div>
      <p className={cn(meta, "leading-relaxed")}>
        <span className="block">{label}</span>
        <span className="block text-muted-foreground tabular-nums">
          {duration}
        </span>
      </p>
    </div>
  );
}

/**
 * Слой с видео на весь экран сцены. В начале обрезан clip-path ровно по
 * миниатюре в плашке, при скролле раскрывается до полного экрана.
 * Без анимаций: обычный блок с видео и контролами под hero.
 */
function ShowreelLayer({
  label,
  duration,
}: {
  label: string;
  duration: string;
}) {
  return (
    <div
      data-reel-layer
      className="pointer-events-none absolute inset-0 z-10 bg-background opacity-0 [clip-path:inset(50%_round_999px)] motion-reduce:pointer-events-auto motion-reduce:relative motion-reduce:inset-auto motion-reduce:mx-4 motion-reduce:mb-28 motion-reduce:aspect-[16/10] motion-reduce:overflow-hidden motion-reduce:rounded-3xl motion-reduce:opacity-100 motion-reduce:[clip-path:none] sm:motion-reduce:mx-6 md:motion-reduce:mx-10"
    >
      <ShowreelVideo
        src={showreel.src}
        srcMobile={showreel.srcMobile}
        poster={showreel.poster}
        posterMobile={showreel.posterMobile}
        label={label}
      />
      <div
        aria-hidden
        data-reel-caption
        className={cn(
          meta,
          "absolute inset-x-0 top-0 flex justify-between bg-linear-to-b from-background/70 to-transparent p-5 text-foreground opacity-0 sm:p-8 motion-reduce:hidden",
        )}
      >
        <span>{label}</span>
        <span className="tabular-nums">{duration}</span>
      </div>
    </div>
  );
}

/**
 * Сетка точек поверх WebGL-тумана (components/webgl/mist-background.tsx).
 * data-depth: сила и направление параллакса за курсором (hero-motion.tsx)
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div data-depth="0.15" className="hero-dots absolute -inset-8" />
    </div>
  );
}
