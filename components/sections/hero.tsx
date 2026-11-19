import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Magnetic } from "@/components/motion/magnetic";
import { Link } from "@/i18n/navigation";
import { showreel } from "@/lib/showreel";
import { cn } from "@/lib/utils";
import { HeroMotion } from "./hero-motion";
import { ProjectRing } from "./project-ring";
import { ReelPlayButton } from "./reel-play-button";
import { ShowreelVideo } from "./showreel-video";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/** 22 → «0:22» */
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Hero: композиция вокруг оси.
 * - По центру орбита и горизонтальная ось с HUD-подписями, на оси узкое
 *   окно шоурила с кнопкой play (полноэкранное видео).
 * - Сверху справа роль, меняющееся слово и CTA; снизу слева имя (h1).
 * - Скролл (hero-motion.tsx): окно растёт в большую карточку с видео,
 *   затем карточка сжимается и встаёт в кольцо проектов (project-ring.tsx),
 *   кольцо вращается скроллом и расходится перед карточками работ.
 * Без анимаций: обычный hero и видео под ним.
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  const common = await getTranslations("Common");

  const [first = "", ...rest] = common("name")
    .split(/[\s·・]+/)
    .filter(Boolean);
  const last = rest.join(" ");
  const words = t.raw("words") as string[];
  const duration = formatDuration(showreel.duration);

  return (
    <section
      aria-labelledby="hero-title"
      data-hero-scene
      className="relative h-[640svh] motion-reduce:h-auto"
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

            {/* Верх: статус слева; роль, слово и CTA справа */}
            <div className="flex items-start justify-between gap-6">
              <p
                data-reveal
                className={cn(
                  meta,
                  "flex items-center gap-2 leading-relaxed text-muted-foreground",
                )}
              >
                <span aria-hidden className="relative flex size-2 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
                  <span className="relative size-2 rounded-full bg-success" />
                </span>
                {t("available")}
              </p>

              <div className="flex flex-col items-end gap-3 text-end sm:gap-4">
                <p data-reveal className={cn(meta, "leading-relaxed")}>
                  <span className="block">{common("role")}</span>
                  <span className="block text-muted-foreground">
                    {t("tagline")}
                  </span>
                </p>
                {/* Меняющееся слово: перебор символов в hero-motion.tsx */}
                <p
                  data-reveal
                  aria-hidden
                  className="text-[clamp(2.25rem,6.5cqi,6rem)] leading-[0.9] font-light tracking-[-0.04em] text-brand"
                >
                  <span data-hero-word>{words[0]}</span>
                </p>
                <div data-reveal>
                  <Magnetic>
                    <Link
                      href="/contact"
                      className={cn(
                        meta,
                        "group/cta inline-flex h-11 items-center gap-2 rounded-full border border-foreground/30 bg-background/40 ps-5 pe-1.5 backdrop-blur transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
                      )}
                    >
                      {t("cta")}
                      <span
                        data-magnetic-inner
                        className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/cta:rotate-45 rtl:-scale-x-100"
                      >
                        <ArrowUpRight aria-hidden className="size-4" />
                      </span>
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>

            {/* Центр: ось с окном шоурила */}
            <div className="flex flex-1 items-center py-8">
              <HeroAxis label={t("showreel")} play={t("playReel")} duration={duration} />
            </div>

            {/* Низ: имя слева, манифест справа */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
              <h1
                id="hero-title"
                data-hero-name
                data-depth="0.25"
                className="flex flex-col tracking-[-0.05em]"
              >
                <span className="text-[clamp(2rem,5.5cqi,5rem)] leading-none font-light">
                  {first}
                </span>
                {last && (
                  <span className="-ms-[0.04em] text-[clamp(3.75rem,15cqi,13.5rem)] leading-[0.85] font-normal">
                    {last}
                  </span>
                )}
              </h1>
              <p
                data-reveal
                className="max-w-xs text-sm text-pretty text-muted-foreground sm:text-base md:mb-3 md:text-end"
              >
                {t("manifesto")}
              </p>
            </div>
          </div>

          <ShowreelLayer label={t("showreel")} play={t("playReel")} duration={duration} />
          <ProjectRing />
        </div>
      </HeroMotion>

      {/* Без JS сцена не запустится: показываем hero одним экраном, слои шоурила и кольца прячем */}
      <noscript>
        <style>
          {
            "[data-hero-name],[data-reveal],[data-hero-intro]{visibility:visible!important}[data-reel-layer],[data-ring]{display:none}[data-hero-scene]{height:auto}"
          }
        </style>
      </noscript>
    </section>
  );
}

/**
 * Горизонтальная ось через весь экран: координаты (следуют за курсором,
 * hero-motion.tsx), подпись, окно шоурила [data-reel-thumb], длительность.
 * Окно только задаёт место: видео лежит в слое ShowreelLayer, обрезанном
 * по окну, а кнопка play здесь, под слоем (слой не ловит клики).
 */
function HeroAxis({
  label,
  play,
  duration,
}: {
  label: string;
  play: string;
  duration: string;
}) {
  const line = "h-px flex-1 origin-center bg-foreground/20";

  return (
    <div
      className={cn(
        meta,
        "flex w-full items-center gap-3 text-muted-foreground sm:gap-5",
      )}
    >
      <span aria-hidden className="hidden tabular-nums lg:block" data-hero-intro>
        <span data-hero-coord="y">0.0000</span>°
      </span>
      <span aria-hidden data-hero-intro data-hero-line className={line} />
      <span aria-hidden data-hero-intro className="hidden sm:block">
        {label}
      </span>

      <div data-reveal className="relative shrink-0">
        {/* Точки у углов окна */}
        <span aria-hidden className="pointer-events-none absolute -inset-3 sm:-inset-4">
          {["start-0 top-0", "end-0 top-0", "start-0 bottom-0", "end-0 bottom-0"].map(
            (position) => (
              <span
                key={position}
                className={cn("absolute size-1 rounded-full bg-foreground/50", position)}
              />
            ),
          )}
        </span>
        <div
          data-reel-thumb
          className="relative grid h-[clamp(4.5rem,9vw,8.5rem)] w-[clamp(12rem,32vw,30rem)] place-items-center overflow-hidden rounded-xl border bg-muted"
        >
          <div aria-hidden className="hero-reel-placeholder absolute inset-[-50%] opacity-60" />
          {/* С анимациями кнопка живёт в слое видео (над окном), здесь только без них */}
          <ReelPlayButton label={play} className="relative motion-safe:hidden" />
        </div>
      </div>

      <span aria-hidden data-hero-intro className="hidden tabular-nums sm:block">
        {duration}
      </span>
      <span aria-hidden data-hero-intro data-hero-line className={line} />
      <span aria-hidden className="hidden tabular-nums lg:block" data-hero-intro>
        <span data-hero-coord="x">0.0000</span>°
      </span>
    </div>
  );
}

/**
 * Слой с видео поверх сцены. В начале обрезан clip-path ровно по окну
 * на оси, при скролле раскрывается в большую карточку.
 * Без анимаций: обычный блок с видео и контролами под hero.
 */
function ShowreelLayer({
  label,
  play,
  duration,
}: {
  label: string;
  play: string;
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
      {/* HUD: кнопка play стоит в центре окна и при скролле переезжает
          в центр карточки, подписи проявляются к концу раскрытия */}
      <div className="absolute inset-0 grid place-items-center motion-reduce:hidden">
        <div
          data-reel-hud
          className={cn(
            meta,
            "flex items-center gap-4 text-foreground sm:gap-8",
          )}
        >
          <span aria-hidden data-reel-caption className="hidden opacity-0 sm:block">
            +
          </span>
          <span aria-hidden data-reel-caption className="opacity-0">
            {label}
          </span>
          <ReelPlayButton label={play} />
          <span aria-hidden data-reel-caption className="tabular-nums opacity-0">
            {duration}
          </span>
          <span aria-hidden data-reel-caption className="hidden opacity-0 sm:block">
            +
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Фон сцены поверх WebGL-тумана: сетка точек, орбита с бегущими точками
 * и плюсики-метки. data-depth: сила параллакса за курсором (hero-motion.tsx).
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div data-depth="0.15" className="hero-dots absolute -inset-8" />
      <div
        data-depth="0.4"
        className="absolute inset-0 grid place-items-center"
      >
        <div
          data-hero-intro
          data-hero-orbit
          className="relative aspect-square w-[min(118vw,74svh)] rounded-full border border-foreground/12 md:w-[min(64vw,80svh)]"
        >
          <div className="absolute inset-0 animate-[spin_80s_linear_infinite] motion-reduce:animate-none">
            <span className="absolute top-[14.6%] left-[14.6%] size-1.5 -translate-1/2 rounded-full bg-foreground/60" />
            <span className="absolute top-[85.4%] left-[85.4%] size-1.5 -translate-1/2 rounded-full bg-foreground/60" />
            <span className="absolute top-1/2 left-0 size-1 -translate-1/2 rounded-full bg-brand" />
          </div>
        </div>
      </div>
      {[
        "top-[18%] start-[8%]",
        "top-[30%] end-[22%]",
        "bottom-[30%] start-[30%]",
        "bottom-[18%] end-[12%]",
        "top-[12%] start-[46%]",
      ].map((position) => (
        <span
          key={position}
          data-hero-intro
          className={cn(
            "absolute font-mono text-xs text-foreground/30",
            position,
          )}
        >
          +
        </span>
      ))}
    </div>
  );
}
