import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { contentAttrs } from "@/lib/content-lang";
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
 * Избранные работы: сразу за hero. Карточка первой работы
 * [data-work-handoff] принимает копию, перелетевшую из карусели hero
 * (hero-motion.tsx). Первая работа большой карточкой,
 * дальше пары в две колонки, между ними фраза о работах.
 * Карточки ведут на страницы кейсов, внизу ссылка на все работы.
 */
export async function FeaturedWork() {
  const t = await getTranslations("Work");
  const more = await getTranslations("WorkMore");
  const locale = await getLocale();
  const [first, ...rest] = projects.filter((project) => project.isFeatured);
  // Тексты проектов пока на английском
  const content = contentAttrs(locale);
  const card = (project: MockProject, large = false) => (
    <WorkCard
      key={project.slug}
      project={project}
      large={large}
      content={content}
    />
  );

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative z-10 px-4 pt-16 pb-24 min-[400px]:px-5 sm:px-6 md:px-[11vw] md:pt-24 md:pb-32"
    >
      <h2 id="work-title" className="sr-only">
        {t("title")}
      </h2>
      <FeaturedWorkMotion>
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 md:gap-x-5 md:gap-y-16">
          {first && card(first, true)}
          {rest.slice(0, 2).map((project) => card(project))}

          {/* Фраза между рядами */}
          <div className="flex flex-col items-center gap-5 py-10 text-center md:col-span-2 md:py-20">
            <p
              data-work-reveal
              aria-hidden
              className={cn(meta, "text-muted-foreground")}
            >
              {t("label")}
            </p>
            <p
              data-work-reveal
              className="max-w-3xl text-2xl leading-tight font-light tracking-[-0.03em] text-balance sm:text-4xl"
            >
              {t("intro")}
            </p>
          </div>

          {rest.slice(2).map((project) => card(project))}
        </div>

        <div className="mt-16 flex justify-center md:mt-24">
          <Link
            href="/work"
            className={cn(
              meta,
              "group/all inline-flex h-12 items-center gap-3 rounded-full border border-foreground/30 ps-6 pe-1.5 transition-colors hover:border-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {more("all")}
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover/all:rotate-45 rtl:-scale-x-100"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>
      </FeaturedWorkMotion>
    </section>
  );
}

function WorkCard({
  project,
  large,
  content,
}: {
  project: MockProject;
  large: boolean;
  content: { lang?: string; dir?: "ltr" };
}) {
  const { cover, preview } = media(project.slug);

  return (
    <article
      data-work-card
      data-work-handoff={large || undefined}
      className={cn(
        "group/card relative flex flex-col gap-3",
        large && "md:col-span-2",
      )}
    >
      <div
        data-work-media
        className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted md:aspect-[2/1]"
      >
        {/* У большой карточки без параллакса: в неё точно садится копия из спирали */}
        <div
          data-work-parallax={large ? undefined : ""}
          className={cn(
            "absolute inset-x-0",
            large ? "inset-y-0" : "-inset-y-[6%]",
          )}
        >
          <Image
            src={cover}
            alt=""
            fill
            sizes={
              large
                ? "(min-width: 768px) 78vw, 100vw"
                : "(min-width: 768px) 39vw, 100vw"
            }
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
      </div>

      <div className="flex items-start justify-between gap-4">
        <div {...content} className="flex flex-col gap-1">
          <h3 className="text-base leading-snug sm:text-lg">
            <Link
              href={`/work/${project.slug}`}
              // Вся карточка кликабельна: ссылка растянута псевдоэлементом
              className="rounded-sm after:absolute after:inset-0"
            >
              {project.title}
            </Link>
          </h3>
          <p className={cn(meta, "text-muted-foreground")}>
            <span dir="ltr" className="tabular-nums">
              {project.year}
            </span>
            {" · "}
            {project.stack.slice(0, 3).join(" · ")}
          </p>
        </div>
        <ArrowUpRight
          aria-hidden
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-[rotate,color] duration-500 group-hover/card:rotate-45 group-hover/card:text-brand rtl:-scale-x-100"
        />
      </div>
    </article>
  );
}
