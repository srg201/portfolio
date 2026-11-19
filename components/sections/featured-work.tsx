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
 * Избранные работы: сюда расходится кольцо проектов из hero.
 * Первая работа большой карточкой на всю ширину, остальные сеткой
 * в две колонки (на мобиле в одну). Под обложкой название и строка
 * «год · стек». Движение в featured-work-motion.tsx.
 * Ссылки пока ведут на живые сайты: страницы кейсов появятся на этапе 6.
 */
export async function FeaturedWork() {
  const t = await getTranslations("Work");
  const locale = await getLocale();
  const featured = projects.filter((project) => project.isFeatured);
  const count = String(featured.length).padStart(2, "0");
  // Тексты проектов пока на английском: подсказываем это скринридеру
  const contentLang = locale === "en" ? undefined : "en";

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative scroll-mt-8 px-4 pt-16 pb-24 min-[400px]:px-5 sm:px-6 md:px-10 md:pt-24 md:pb-32"
    >
      <FeaturedWorkMotion>
        <header className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col gap-5">
            <p data-work-reveal aria-hidden className={cn(meta, "text-brand")}>
              ( {t("label")} ){" "}
              <span className="text-muted-foreground tabular-nums">{count}</span>
            </p>
            <h2
              id="work-title"
              data-work-reveal
              className="text-5xl leading-[0.9] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
            >
              {t("title")}
            </h2>
          </div>
          <p
            data-work-reveal
            className="max-w-sm text-base text-pretty text-muted-foreground sm:text-lg md:text-end"
          >
            {t("intro")}
          </p>
        </header>

        <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
          {featured.map((project, index) => (
            <WorkCard
              key={project.slug}
              project={project}
              large={index === 0}
              contentLang={contentLang}
              visit={t("visit")}
              newTab={t("newTab")}
            />
          ))}
        </div>
      </FeaturedWorkMotion>
    </section>
  );
}

function WorkCard({
  project,
  large,
  contentLang,
  visit,
  newTab,
}: {
  project: MockProject;
  large: boolean;
  contentLang: string | undefined;
  visit: string;
  newTab: string;
}) {
  const { cover, preview } = media(project.slug);

  return (
    <article
      data-work-card
      className={cn(
        "group/card relative flex flex-col gap-4 md:gap-5",
        large && "md:col-span-2",
      )}
    >
      <div
        data-work-media
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-muted md:rounded-3xl",
          large ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[16/10]",
        )}
      >
        <div data-work-parallax className="absolute -inset-y-[6%] inset-x-0">
          <Image
            src={cover}
            alt=""
            fill
            sizes={large ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
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
        <span
          aria-hidden
          className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/card:rotate-45 rtl:-scale-x-100"
        >
          <ArrowUpRight className="size-5" />
        </span>
      </div>

      <div lang={contentLang} className="flex flex-col gap-2">
        <h3
          className={cn(
            "leading-none font-semibold tracking-[-0.03em]",
            large ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
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
        <p className={cn(meta, "text-muted-foreground")}>
          <span dir="ltr" className="tabular-nums">
            {project.year}
          </span>
          {" · "}
          {project.stack.slice(0, 3).join(" · ")}
        </p>
      </div>
    </article>
  );
}
