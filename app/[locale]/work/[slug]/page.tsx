import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { LazyVideo } from "@/components/work/lazy-video";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getNextProject, getProject, getProjects } from "@/lib/content";
import { contentAttrs } from "@/lib/content-lang";
import { localeAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

export async function generateStaticParams() {
  const projects = await getProjects(routing.defaultLocale);
  return projects.map((project) => ({ slug: project.slug }));
}

async function load(params: Promise<{ slug: string }>) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  const { slug } = await params;
  const project = await getProject(slug, locale);
  if (!project) notFound();
  return { locale, project };
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, project } = await load(params);
  const cover = project.cover.src;
  return {
    title: project.title,
    description: project.summary,
    alternates: localeAlternates(locale, `/work/${project.slug}`),
    openGraph: { images: [{ url: cover, width: 1280, height: 800 }] },
  };
}

/**
 * Страница кейса: заголовок и ссылки, обложка, мета (год, клиент, роль,
 * стек), что сделано (пункты из README), записи сайта на десктопе
 * и телефоне, переход к следующему проекту.
 * Если перевода нет, тексты проекта на английском: помечаем их lang/dir.
 */
export default async function CasePage({
  params,
}: PageProps<"/[locale]/work/[slug]">) {
  const { locale, project } = await load(params);
  const t = await getTranslations("Case");
  const work = await getTranslations("WorkPage");
  const next = await getNextProject(project.slug, locale);
  const content = contentAttrs(locale, project.lang);
  const nextContent = contentAttrs(locale, next.lang);
  const hasMobile = Boolean(project.caseMobileVideo);

  const facts = [
    { label: t("year"), value: <span dir="ltr">{project.year}</span> },
    { label: t("client"), value: project.client ?? t("personal"), content: project.client ? content : {} },
    { label: t("role"), value: project.role, content },
    { label: t("stack"), value: project.stack.join(", ") },
  ];

  const external = (href: string, label: string, primary = false) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        meta,
        "group/link inline-flex h-12 items-center gap-3 rounded-full ps-5 pe-1.5 transition-colors",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-foreground/30 hover:border-foreground",
      )}
    >
      {label}
      <span className="sr-only"> ({t("newTab")})</span>
      <span
        aria-hidden
        className={cn(
          "grid size-9 place-items-center rounded-full transition-transform duration-500 group-hover/link:rotate-45 rtl:-scale-x-100",
          primary ? "bg-primary-foreground text-primary" : "bg-foreground text-background",
        )}
      >
        <ArrowUpRight className="size-4" />
      </span>
    </a>
  );

  return (
    <main
      id="main"
      className="flex flex-1 flex-col gap-16 px-4 pt-16 pb-32 min-[400px]:px-5 sm:px-6 md:gap-24 md:px-10 md:pt-24"
    >
      <Reveal className="flex flex-col gap-10">
        <Link
          data-reveal-item
          href="/work"
          className={cn(meta, "inline-flex w-fit items-center gap-2 text-muted-foreground hover:text-foreground")}
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {t("back")}
        </Link>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <p data-reveal-item className={cn(meta, "text-brand")}>
              ( {work(`categories.${project.category}`)} )
            </p>
            <h1
              data-reveal-item
              {...content}
              className="text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] font-light tracking-[-0.055em]"
            >
              {project.title}
            </h1>
          </div>
          <div data-reveal-item className="flex max-w-md flex-col gap-6">
            <p {...content} className="text-lg text-pretty text-muted-foreground sm:text-xl">
              {project.summary}
            </p>
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && external(project.liveUrl, t("live"), true)}
              {project.repoUrl && external(project.repoUrl, t("code"))}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted md:aspect-[2/1]">
        <Image
          src={project.cover.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      <Reveal className="grid gap-x-10 gap-y-8 border-y py-10 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} data-reveal-item className="flex flex-col gap-2">
            <p className={cn(meta, "text-muted-foreground")}>{fact.label}</p>
            <p {...("content" in fact ? fact.content : {})} className="text-base text-pretty sm:text-lg">
              {fact.value}
            </p>
          </div>
        ))}
      </Reveal>

      {project.highlights.length > 0 && (
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2
            data-reveal-item
            className="text-4xl leading-none font-light tracking-[-0.04em] sm:text-5xl"
          >
            {t("highlights")}
          </h2>
          <ol {...content} className="flex flex-col">
            {project.highlights.map((item, index) => (
              <li
                key={item}
                data-reveal-item
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t py-5 text-base text-pretty sm:text-lg"
              >
                <span dir="ltr" className={cn(meta, "pt-1.5 text-brand tabular-nums")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Reveal>
      )}

      {project.caseVideo && (
      <Reveal className="flex flex-col gap-8">
        <h2
          data-reveal-item
          className="text-4xl leading-none font-light tracking-[-0.04em] sm:text-5xl"
        >
          {t("showcase")}
        </h2>
        <div
          className={cn(
            "grid items-start gap-6 md:gap-8",
            hasMobile && "md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]",
          )}
        >
          <figure data-reveal-item className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border bg-muted shadow-2xl">
              <div aria-hidden className="flex h-7 items-center gap-1.5 border-b bg-background/60 px-3">
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/20" />
              </div>
              <div className="aspect-[16/10]">
                <LazyVideo
                  src={project.caseVideo}
                  poster={project.cover.src}
                  label={`${project.title}, ${t("desktop")}`}
                />
              </div>
            </div>
            <figcaption className={cn(meta, "text-muted-foreground")}>{t("desktop")}</figcaption>
          </figure>
          {hasMobile && (
            <figure data-reveal-item className="mx-auto flex w-full max-w-64 flex-col gap-3 md:max-w-none">
              <div className="overflow-hidden rounded-[2rem] border-4 border-foreground/15 bg-muted shadow-2xl">
                <div className="aspect-[540/920]">
                  <LazyVideo
                    src={project.caseMobileVideo!}
                    label={`${project.title}, ${t("mobile")}`}
                  />
                </div>
              </div>
              <figcaption className={cn(meta, "text-muted-foreground")}>{t("mobile")}</figcaption>
            </figure>
          )}
        </div>
      </Reveal>
      )}

      {/* Следующий проект */}
      <Link
        href={`/work/${next.slug}`}
        className="group/next flex flex-col gap-6 border-t pt-10 md:pt-14"
      >
        <p className={cn(meta, "text-muted-foreground")}>{t("next")}</p>
        <div className="flex items-end justify-between gap-6">
          <span
            {...nextContent}
            className="text-[clamp(3rem,10vw,9rem)] leading-[0.85] font-light tracking-[-0.05em] transition-colors duration-500 group-hover/next:text-brand"
          >
            {next.title}
          </span>
          <span
            aria-hidden
            className="mb-2 grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/next:rotate-45 rtl:-scale-x-100 md:size-20"
          >
            <ArrowUpRight className="size-6 md:size-8" />
          </span>
        </div>
        <div className="relative aspect-[3/1] overflow-hidden rounded-md bg-muted">
          <Image
            src={next.cover.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top opacity-70 transition-[opacity,scale] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/next:scale-[1.03] group-hover/next:opacity-100"
          />
        </div>
      </Link>
    </main>
  );
}
