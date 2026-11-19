"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FINE_POINTER } from "@/components/motion/magnetic";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";
import { cn } from "@/lib/utils";

export type ServiceItem = {
  slug: string;
  number: string;
  title: string;
  description: string;
  stack: string[];
  /** null: подходящего проекта в портфолио нет */
  example: { cover: string; label: string } | null;
};

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Список услуг.
 * - Аккордеон shadcn (Base UI): клавиатура, aria, анимация высоты.
 * - Мышь (cursor-preview): рядом с курсором (сбоку, не под ним) плывёт
 *   небольшая карточка с примером услуги и подписью; картинки сменяются
 *   шторкой.
 * - Тач и reduced motion: пример внутри раскрытой услуги.
 */
export function ServicesList({ items }: { items: ServiceItem[] }) {
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
        // Лёгкий наклон по горизонтальной скорости курсора
        const tilt = gsap.quickTo(card, "rotate", {
          duration: 0.8,
          ease: "power3",
        });
        let lastX = 0;

        // Карточка сбоку от курсора, а не под ним: указатель всегда виден.
        // В правой части экрана перескакивает на левую сторону
        const GAP = 28;
        const besideX = (clientX: number) =>
          clientX > window.innerWidth * 0.6
            ? clientX - GAP - card.offsetWidth
            : clientX + GAP;

        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          x(besideX(event.clientX));
          y(event.clientY);
          tilt(gsap.utils.clamp(-4, 4, (event.clientX - lastX) * 0.25));
          lastX = event.clientX;
        };
        const enter = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          // Первое появление сразу у курсора, без пролёта из угла
          gsap.set(card, { x: besideX(event.clientX), y: event.clientY });
          lastX = event.clientX;
          gsap.to(card, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: ease.out,
            overwrite: "auto",
          });
        };
        const leave = () => {
          gsap.to(card, {
            scale: 0.6,
            autoAlpha: 0,
            rotate: 0,
            duration: 0.3,
            ease: "power3.in",
            overwrite: "auto",
          });
        };

        list.addEventListener("pointermove", move);
        list.addEventListener("pointerenter", enter);
        list.addEventListener("pointerleave", leave);
        return () => {
          list.removeEventListener("pointermove", move);
          list.removeEventListener("pointerenter", enter);
          list.removeEventListener("pointerleave", leave);
        };
      });

      // Строки поднимаются при появлении
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(list.querySelectorAll("[data-service-row]"), {
          autoAlpha: 0,
          y: 40,
          duration: 1,
          ease: ease.out,
          stagger: 0.08,
          scrollTrigger: { trigger: list, start: "top 80%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <Accordion
        defaultValue={items[0] ? [items[0].slug] : []}
        className="border-y"
      >
        {items.map((item) => (
          <AccordionItem
            key={item.slug}
            value={item.slug}
            data-service-row
            onPointerEnter={() => setHovered(item.slug)}
          >
            <AccordionTrigger className="items-center gap-4 rounded-none py-6 hover:no-underline focus-visible:ring-offset-2 sm:gap-6 md:py-8 **:data-[slot=accordion-trigger-icon]:hidden">
              <span
                className={cn(
                  meta,
                  "w-8 shrink-0 text-muted-foreground tabular-nums sm:w-10",
                )}
              >
                {item.number}
              </span>
              <span className="flex-1 text-3xl leading-none font-semibold tracking-[-0.03em] text-balance transition-[translate,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/accordion-trigger:translate-x-3 group-aria-expanded/accordion-trigger:text-brand sm:text-5xl lg:text-6xl rtl:group-hover/accordion-trigger:-translate-x-3">
                {item.title}
              </span>
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full border transition-[rotate,background-color,color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/accordion-trigger:bg-accent group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:bg-primary group-aria-expanded/accordion-trigger:text-primary-foreground sm:size-12"
              >
                <Plus className="size-5" />
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 pb-8 ps-12 sm:ps-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10 md:pb-10">
                <div className="flex flex-col gap-5">
                  <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
                    {item.description}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {item.stack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Пример внутри услуги: на таче и без анимаций */}
                <div className="w-full max-w-sm cursor-preview:hidden md:w-80">
                  <PreviewMedia item={item} sizes="(min-width: 768px) 24rem, 90vw" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Карточка за курсором: все примеры стопкой, видна текущая */}
      <div
        ref={preview}
        aria-hidden
        // left-0, а не start-0: координаты курсора физические и в RTL
        className="pointer-events-none fixed top-0 left-0 z-30 hidden w-56 cursor-preview:block lg:w-64"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted shadow-xl">
          {items.map((item) => (
            <div
              key={item.slug}
              data-active={hovered === item.slug || undefined}
              className="absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:inset(100%_0_0_0)] data-active:[clip-path:inset(0)]"
            >
              <PreviewMedia item={item} sizes="16rem" bare />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Обложка примера с подписью; без примера: фирменная плашка с названием */
function PreviewMedia({
  item,
  sizes,
  bare = false,
}: {
  item: ServiceItem;
  sizes: string;
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden bg-muted",
        bare ? "size-full" : "rounded-2xl border",
      )}
    >
      {item.example ? (
        <>
          <Image
            src={item.example.cover}
            alt=""
            fill
            sizes={sizes}
            className="object-cover object-top"
          />
          <span
            className={cn(
              meta,
              "absolute start-3 bottom-3 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur",
            )}
          >
            {item.example.label}
          </span>
        </>
      ) : (
        <div className="flex size-full flex-col justify-between bg-primary p-5 text-primary-foreground">
          <span className={meta}>{item.number}</span>
          <span className="text-2xl leading-none font-semibold tracking-[-0.03em] text-balance">
            {item.title}
          </span>
        </div>
      )}
    </div>
  );
}
