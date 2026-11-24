"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";

/** Первый показ страницы (загрузка сайта) идёт без шторки: там свой вход */
let mounted = false;

/**
 * Переход между страницами (app/[locale]/template.tsx монтирует его заново
 * при каждой навигации). Новая страница открывается из-под шторки цвета
 * фона, которая уезжает вверх, а контент слегка поднимается.
 * prefers-reduced-motion: без анимации.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const first = !mounted;
    mounted = true;
    const panel = curtain.current;
    const body = content.current;
    if (!panel || !body) return;
    if (first || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.display = "none";
      return;
    }
    const timeline = gsap
      .timeline({
        onComplete: () => {
          panel.style.display = "none";
          // Точки скролл-анимаций мерились со сдвигом входа: пересчитать
          ScrollTrigger.refresh();
        },
      })
      .set(panel, { display: "block", clipPath: "inset(0% 0% 0% 0%)" })
      .to(panel, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.9,
        ease: "expo.inOut",
      })
      .from(
        body,
        {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          // transform на обёртке ломает position: fixed внутри (превью
          // у курсора, перелёт карточки в hero): после входа снимаем его
          clearProps: "transform,opacity,visibility",
        },
        0.35,
      );
    return () => {
      timeline.kill();
      gsap.set(body, { clearProps: "all" });
    };
  }, []);

  return (
    <>
      <div ref={content} className="flex flex-1 flex-col">
        {children}
      </div>
      <div
        ref={curtain}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[45] hidden bg-foreground"
      />
    </>
  );
}
