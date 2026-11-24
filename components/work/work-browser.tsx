"use client";

import { ArrowUpRight, LayoutGrid, List } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FINE_POINTER } from "@/components/motion/magnetic";
import { Link } from "@/i18n/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import type { ProjectCategory } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

export type WorkItem = {
  slug: string;
  title: string;
  summary: string;
  year: number;
  category: ProjectCategory;
  categoryLabel: string;
  stack: string[];
  cover: string;
  preview: string;
};

type Labels = {
  filter: string;
  all: string;
  view: string;
  grid: string;
  list: string;
  projects: string;
  open: string;
  categories: Record<ProjectCategory, string>;
};

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Все работы: фильтр по типу и вид «сетка / список».
 * - Карточки перестраиваются анимацией layout (Motion), лишние уходят.
 * - Сетка: обложка, при наведении мышью играет превью.
 * - Список: строки, рядом с курсором (сбоку, не под ним) плывёт обложка.
 * - prefers-reduced-motion: без анимаций перестройки и превью.
 * Тексты проектов пока на английском: lang="en" у них, если язык сайта другой.
 */
export function WorkBrowser({
  items,
  labels,
  content,
}: {
  items: WorkItem[];
  labels: Labels;
  content: { lang?: string; dir?: "ltr" };
}) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const categories = [...new Set(items.map((item) => item.category))];
  const visible =
    filter === "all" ? items : items.filter((item) => item.category === filter);

  // Высота списка меняется: пересчитать точки скролл-анимаций ниже (футер)
  useEffect(() => {
    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 900);
    return () => window.clearTimeout(timer);
  }, [view, filter]);

  const chip = (active: boolean) =>
    cn(
      meta,
      "inline-flex h-10 items-center gap-2 rounded-full border px-4 transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-foreground/20 hover:border-foreground/60",
    );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
            {(["all", ...categories] as const).map((key) => {
              const count =
                key === "all"
                  ? items.length
                  : items.filter((item) => item.category === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={chip(filter === key)}
                >
                  {key === "all" ? labels.all : labels.categories[key]}
                  <span aria-hidden className="tabular-nums opacity-60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div role="group" aria-label={labels.view} className="flex gap-2">
            {(["grid", "list"] as const).map((key) => {
              const Icon = key === "grid" ? LayoutGrid : List;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  aria-label={labels[key]}
                  onClick={() => setView(key)}
                  className={cn(chip(view === key), "w-10 justify-center px-0")}
                >
                  <Icon aria-hidden className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Объявляем число проектов после смены фильтра */}
        <p aria-live="polite" className="sr-only">
          {visible.length} {labels.projects}
        </p>

        <LayoutGroup>
          {view === "grid" ? (
            <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((item, index) => (
                  <motion.li
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: EASE, delay: index * 0.04 }}
                  >
                    <GridCard item={item} content={content} open={labels.open} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <ListView items={visible} content={content} open={labels.open} />
          )}
        </LayoutGroup>
      </div>
    </MotionConfig>
  );
}

function GridCard({
  item,
  content,
  open,
}: {
  item: WorkItem;
  content: { lang?: string; dir?: "ltr" };
  open: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const canPreview = () =>
    typeof window !== "undefined" && matchMedia(FINE_POINTER).matches;

  return (
    <Link
      href={`/work/${item.slug}`}
      className="group/card flex flex-col gap-4 rounded-md"
      onPointerEnter={(event) => {
        const element = video.current;
        if (event.pointerType !== "mouse" || !element || !canPreview()) return;
        if (!element.src) element.src = item.preview;
        element
          .play()
          .then(() => (element.dataset.playing = ""))
          .catch(() => {});
      }}
      onPointerLeave={() => {
        const element = video.current;
        if (!element) return;
        delete element.dataset.playing;
        element.pause();
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
        <Image
          src={item.cover}
          alt=""
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover object-top transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.03] motion-reduce:transition-none"
        />
        <video
          ref={video}
          aria-hidden
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-500 data-playing:opacity-100"
        />
        <span
          className={cn(
            meta,
            "absolute start-3 top-3 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur",
          )}
        >
          {item.categoryLabel}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 {...content} className="text-xl leading-tight sm:text-2xl">
            {item.title}
          </h2>
          <p {...content} className="max-w-md text-sm text-pretty text-muted-foreground">
            {item.summary}
          </p>
          <p className={cn(meta, "mt-1 text-muted-foreground")}>
            <span dir="ltr" className="tabular-nums">
              {item.year}
            </span>
            {" · "}
            {item.stack.slice(0, 3).join(" · ")}
          </p>
        </div>
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full border transition-[rotate,background-color,color,border-color] duration-500 group-hover/card:rotate-45 group-hover/card:border-primary group-hover/card:bg-primary group-hover/card:text-primary-foreground rtl:-scale-x-100"
        >
          <ArrowUpRight className="size-4" />
        </span>
        <span className="sr-only">{open}</span>
      </div>
    </Link>
  );
}

/** Список: строки с номером, названием, типом и годом; обложка рядом с курсором */
function ListView({
  items,
  content,
  open,
}: {
  items: WorkItem[];
  content: { lang?: string; dir?: "ltr" };
  open: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useGSAP(
    () => {
      const list = root.current;
      const card = preview.current;
      if (!list || !card) return;
      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        gsap.set(card, { yPercent: -50, scale: 0.6, autoAlpha: 0 });
        const x = gsap.quickTo(card, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(card, "y", { duration: 0.6, ease: "power3" });
        const GAP = 28;
        const besideX = (clientX: number) =>
          clientX > window.innerWidth * 0.55
            ? clientX - GAP - card.offsetWidth
            : clientX + GAP;
        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          x(besideX(event.clientX));
          y(event.clientY);
        };
        const enter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          gsap.set(card, { x: besideX(event.clientX), y: event.clientY });
          gsap.to(card, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
        };
        const leave = () =>
          gsap.to(card, { scale: 0.6, autoAlpha: 0, duration: 0.3, ease: "power3.in", overwrite: "auto" });
        list.addEventListener("pointermove", move);
        list.addEventListener("pointerenter", enter);
        list.addEventListener("pointerleave", leave);
        return () => {
          list.removeEventListener("pointermove", move);
          list.removeEventListener("pointerenter", enter);
          list.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <ul className="border-t">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, index) => (
            <motion.li
              key={item.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.03 }}
              className="border-b"
              onPointerEnter={() => setHovered(item.slug)}
            >
              <Link
                href={`/work/${item.slug}`}
                className="group/row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_10rem_4rem_auto] sm:gap-6 md:py-8"
              >
                <span dir="ltr" className={cn(meta, "text-muted-foreground tabular-nums")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  {...content}
                  className="text-3xl leading-none font-light tracking-[-0.03em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-3 group-hover/row:text-brand sm:text-5xl rtl:group-hover/row:-translate-x-3"
                >
                  {item.title}
                </span>
                <span className={cn(meta, "hidden text-muted-foreground sm:block")}>
                  {item.categoryLabel}
                </span>
                <span dir="ltr" className={cn(meta, "hidden text-muted-foreground tabular-nums sm:block")}>
                  {item.year}
                </span>
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-full border transition-[rotate,background-color,color,border-color] duration-500 group-hover/row:rotate-45 group-hover/row:border-primary group-hover/row:bg-primary group-hover/row:text-primary-foreground rtl:-scale-x-100"
                >
                  <ArrowUpRight className="size-4" />
                </span>
                <span className="sr-only">{open}</span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Обложка рядом с курсором: все стопкой, видна текущая */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 hidden w-64 cursor-preview:block lg:w-72"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted shadow-xl">
          {items.map((item) => (
            <div
              key={item.slug}
              data-active={hovered === item.slug || undefined}
              className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:inset(100%_0_0_0)] data-active:[clip-path:inset(0)]"
            >
              <Image src={item.cover} alt="" fill sizes="18rem" className="object-cover object-top" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
