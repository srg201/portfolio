import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { projects, type MockProject } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";
import { FeaturedWorkMotion } from "./featured-work-motion";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/** Медиа карточки: `pnpm covers` (scripts/build-covers.ts) */
function media(slug: string) {
  return {
    cover: `/work/${slug}/cover.jpg`,
    preview: `/work/${slug}/preview.mp4`,
  };
}

/**
 * Избранные работы.
 * Десктоп: секция закрепляется, лента карточек едет горизонтально
 * (featured-work-motion.tsx). Мобила: вертикальный список.
 * prefers-reduced-motion на десктопе: сетка в две колонки.
 * Ссылки пока ведут на живые сайты: страницы кейсов появятся на этапе 6.
 */
export async function FeaturedWork() {
  const t = await getTranslations("Work");
  const locale = await getLocale();
  const featured = projects.filter((project) => project.isFeatured);
  const count = String(featured.length).padStart(2, "0");

  return (
    <section aria-labelledby="work-title" className="relative">
      <FeaturedWorkMotion>
        <div
          data-work-pin
          className="relative flex flex-col px-4 py-24 min-[400px]:px-5 sm:px-6 md:px-10 md:motion-safe:h-svh md:motion-safe:justify-center md:motion-safe:py-0 md:motion-safe:pb-20"
        >
          {/* Рамка ленты: до гидрации прокручивается сама (без JS тоже всё доступно),
              после неё обрезает, а лента внутри двигается скроллом страницы */}
          <div
            data-work-viewport
            className="md:motion-safe:-mx-10 md:motion-safe:overflow-x-auto md:motion-safe:[scrollbar-width:none] md:motion-safe:data-ready:overflow-x-clip"
          >
          <div
            data-work-track
            className="flex flex-col gap-16 md:motion-safe:w-max md:motion-safe:flex-row md:motion-safe:items-end md:motion-safe:gap-[5vw] md:motion-safe:px-10 md:motion-reduce:grid md:motion-reduce:grid-cols-2 md:motion-reduce:gap-x-10"
          >
            {/* Вводная панель: первая в ленте */}
            <header className="flex shrink-0 flex-col gap-6 md:motion-safe:w-[min(30vw,26rem)] md:motion-safe:self-center md:motion-reduce:col-span-2">
              <p data-work-reveal aria-hidden className={cn(meta, "text-brand")}>
                ( {t("label")} ){" "}
                <span className="text-muted-foreground tabular-nums">
                  {count}
                </span>
              </p>
              <h2
                id="work-title"
                data-work-reveal
                className="text-5xl leading-[0.9] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
              >
                {t("title")}
              </h2>
              <p
                data-work-reveal
                className="max-w-sm text-base text-pretty text-muted-foreground sm:text-lg"
              >
                {t("intro")}
              </p>
            </header>

            {featured.map((project, index) => (
              <WorkCard
                key={project.slug}
                project={project}
                index={index + 1}
                total={featured.length}
                // Тексты проектов пока на английском: подсказываем это скринридеру
                contentLang={locale === "en" ? undefined : "en"}
                visit={t("visit")}
                newTab={t("newTab")}
              />
            ))}
          </div>
          </div>

          {/* Прогресс горизонтальной ленты */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 bottom-28 hidden h-px bg-border md:motion-safe:block"
          >
            <div
              data-work-progress
              className="h-full origin-left scale-x-0 bg-brand rtl:origin-right"
            />
          </div>
        </div>
      </FeaturedWorkMotion>
    </section>
  );
}

function WorkCard({
  project,
  index,
  total,
  contentLang,
  visit,
  newTab,
}: {
  project: MockProject;
  index: number;
  total: number;
  contentLang: string | undefined;
  visit: string;
  newTab: string;
}) {
  const { cover, preview } = media(project.slug);
  const number = (n: number) => String(n).padStart(2, "0");

  return (
    <article
      data-work-card
      className="group/card relative flex shrink-0 flex-col gap-5 md:motion-safe:w-[min(62vw,calc(56svh*1.6))]"
    >
      <div
        data-work-media
        className="relative aspect-[16/10] overflow-hidden rounded-3xl border bg-muted"
      >
        <div data-work-parallax className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 768px) 62vw, 100vw"
            className="object-cover object-top transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03] motion-reduce:transition-none"
          />
          {/* Превью грузится только при наведении (featured-work-motion.tsx) */}
          <video
            data-work-preview
            data-src={preview}
            aria-hidden
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-500 data-playing:opacity-100"
          />
        </div>
        {/* dir="ltr": в RTL «02 / 05» не переворачивается в «05 / 02» */}
        <span
          dir="ltr"
          className={cn(
            meta,
            "absolute start-4 top-4 rounded-full bg-background/80 px-3 py-1.5 tabular-nums backdrop-blur",
          )}
        >
          {number(index)} / {number(total)}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div lang={contentLang} className="flex max-w-xl flex-col gap-2">
          <h3 className="text-3xl leading-none font-semibold tracking-[-0.03em] sm:text-4xl">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Вся карточка кликабельна: ссылка растянута псевдоэлементом
              className="rounded-sm after:absolute after:inset-0 after:rounded-3xl"
            >
              {project.title}
              <span className="sr-only">
                {" "}
                ({visit}, {newTab})
              </span>
            </a>
          </h3>
          <p className="text-pretty text-muted-foreground">
            {project.summary}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <p className={cn(meta, "text-muted-foreground tabular-nums")}>
            {project.year}
          </p>
          <ul className="flex flex-wrap gap-1.5 sm:max-w-64 sm:justify-end">
            {project.stack.slice(0, 4).map((tech) => (
              <li
                key={tech}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/card:rotate-45 rtl:-scale-x-100"
      >
        <ArrowUpRight className="size-5" />
      </span>
    </article>
  );
}
