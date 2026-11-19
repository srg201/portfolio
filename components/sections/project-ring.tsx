import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import { getCareerStats } from "@/lib/career";
import { projects } from "@/lib/mock/projects";
import { showreel } from "@/lib/showreel";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";
const CARDS = 16;

/** Первая избранная работа: её карточка из спирали перелетает в секцию работ */
const handoff = projects.find((project) => project.isFeatured)!;
export const handoffCover = `/work/${handoff.slug}/cover.jpg`;

/**
 * Спираль проектов после шоурила (часть сцены hero).
 * Карточки раскладывает ring-motion.ts: виток спирали вокруг текста,
 * его двигают скролл и медленный дрейф (hero-motion.tsx). Первая карточка:
 * шоурил, в неё сжимается видео. В конце сцены спираль разлетается,
 * а карточка первой работы перелетает на своё место в секции работ.
 * Без анимаций: статичная композиция.
 */
export async function ProjectRing() {
  const t = await getTranslations("Stats");
  const format = await getFormatter();
  const { days, years, startYear, projects: count } = await getCareerStats();

  const covers = [
    ...projects
      .filter((project) => project.inCarousel)
      .map((project) => `/work/${project.slug}/cover.jpg`),
    "/work/portfolio/cover.jpg",
  ];
  // Шоурил первым, дальше обложки по кругу до заполнения спирали
  const cards = [
    showreel.poster,
    ...Array.from(
      { length: CARDS - 1 },
      (_, index) => covers[index % covers.length]!,
    ),
  ];

  return (
    <div
      data-ring
      className="ring-stage pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-0 motion-reduce:pointer-events-auto motion-reduce:relative motion-reduce:inset-auto motion-reduce:h-svh motion-reduce:opacity-100"
    >
      <div data-ring-scene className="ring-scene absolute inset-0">
        {cards.map((src, index) => (
          <div
            key={index}
            data-ring-card
            data-ring-reel={index === 0 || undefined}
            data-ring-handoff={src === handoffCover || undefined}
            className="ring-card"
          >
            <div
              data-ring-inner
              className="relative size-full overflow-hidden rounded-md border border-foreground/10 bg-muted shadow-2xl"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 15vw, 30vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Текст в центре спирали: над карточками */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
          <p
            data-ring-text
            className="text-lg font-light text-pretty sm:text-2xl"
          >
            {t("lead", { year: String(startYear) })}
          </p>
          <h2
            id="ring-title"
            data-ring-text
            className="text-[clamp(2.75rem,7.5vw,7.5rem)] leading-[0.95] font-light tracking-[-0.045em] text-balance"
          >
            {t("accent")}
          </h2>
          <p
            data-ring-text
            className="max-w-xs text-sm text-pretty text-muted-foreground sm:text-base"
          >
            {t("thanks")}
          </p>
          <a
            data-ring-text
            href="#work"
            className={cn(
              meta,
              "pointer-events-auto mt-2 inline-flex h-11 items-center rounded-full bg-primary px-6 text-primary-foreground transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105",
            )}
          >
            {t("cta")}
          </a>
        </div>
      </div>

      {/* HUD по углам: цифры карьеры */}
      <p
        data-ring-corner
        className={cn(
          meta,
          "absolute start-4 top-6 text-muted-foreground min-[400px]:start-5 sm:start-6 md:start-10 md:top-10",
        )}
      >
        <span className="text-foreground tabular-nums">
          {format.number(days)}
        </span>{" "}
        · {t("days")}
      </p>
      <p
        data-ring-corner
        className={cn(
          meta,
          "absolute end-4 bottom-28 flex flex-col items-end gap-1 text-muted-foreground min-[400px]:end-5 sm:end-6 sm:bottom-32 md:end-10",
        )}
      >
        <span>
          <span dir="ltr" className="text-foreground tabular-nums">
            {format.number(count)}+
          </span>{" "}
          · {t("projects")}
        </span>
        <span>
          <span dir="ltr" className="text-foreground tabular-nums">
            {format.number(years)}+
          </span>{" "}
          · {t("years")}
        </span>
      </p>
    </div>
  );
}

/**
 * Копия карточки первой работы для перелёта из спирали в секцию работ.
 * Лежит вне 3D-сцены: fixed, положение и размер пишет hero-motion.tsx.
 */
export function RingProxy() {
  return (
    <div
      aria-hidden
      data-ring-proxy
      className="pointer-events-none invisible fixed top-0 left-0 z-20 overflow-hidden bg-muted motion-reduce:hidden"
    >
      <Image
        src={handoffCover}
        alt=""
        fill
        sizes="(min-width: 768px) 78vw, 100vw"
        className="object-cover object-top"
      />
    </div>
  );
}
