import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Magnetic } from "@/components/motion/magnetic";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { HeroMotion } from "./hero-motion";
import { ProjectRing, RingProxy } from "./project-ring";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Hero: первая секция.
 * - Сверху справа роль, меняющееся слово и CTA; снизу слева имя (h1).
 * - Посередине, в полосе между ними, вращается карусель обложек проектов
 *   (project-ring.tsx). Она подстраивается под высоту полосы и текст
 *   не перекрывает.
 * - При скролле карусель разлетается, а карточка первой работы перелетает
 *   в секцию работ, которая идёт сразу за hero (hero-motion.tsx).
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  const common = await getTranslations("Common");

  const [first = "", ...rest] = common("name")
    .split(/[\s·・]+/)
    .filter(Boolean);
  const last = rest.join(" ");
  const words = t.raw("words") as string[];

  return (
    <section aria-labelledby="hero-title" data-hero-scene className="relative">
      <HeroMotion words={words}>
        <div data-hero-stage className="relative overflow-x-clip">
          <div
            data-hero-content
            className="@container relative isolate z-10 flex h-full min-h-svh flex-col px-4 pt-5 pb-28 min-[400px]:px-5 sm:px-6 sm:pb-32 md:px-10 md:pt-8"
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

            {/* Центр: карусель проектов в свободной полосе */}
            <div className="relative my-6 min-h-44 flex-1 sm:my-8">
              <ProjectRing />
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
        </div>
      </HeroMotion>
      <RingProxy />

      {/* Без JS сцена не запустится: показываем hero сразу */}
      <noscript>
        <style>
          {
            "[data-hero-name],[data-reveal],[data-hero-intro]{visibility:visible!important}[data-ring]{display:none}"
          }
        </style>
      </noscript>
    </section>
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
