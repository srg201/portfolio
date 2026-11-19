"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";

/** Отметка на экране, где линия «рисуется» и шаги загораются */
const MARK = "60%";
/** Половина узла: линия идёт от центра узла (size-10 → 20px) */
const NODE = 20;

/**
 * Линия процесса рисуется скроллом: отрезок шага заполняется, пока шаг
 * проходит отметку, и узел следующего шага загорается, когда до него
 * дошла линия. Текст шага проявляется при появлении.
 * prefers-reduced-motion: остаётся финальное состояние из разметки.
 */
export function ProcessMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(
          "[data-process-step]",
          root,
        );
        const triggers: ScrollTrigger[] = [];

        steps.forEach((step) => {
          delete step.dataset.active;

          triggers.push(
            ScrollTrigger.create({
              trigger: step,
              start: `top+=${NODE} ${MARK}`,
              onEnter: () => (step.dataset.active = ""),
              onLeaveBack: () => delete step.dataset.active,
            }),
          );

          const line = step.querySelector("[data-process-line]");
          if (line) {
            gsap.fromTo(
              line,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: step,
                  start: `top+=${NODE} ${MARK}`,
                  end: `bottom+=${NODE} ${MARK}`,
                  scrub: 0.4,
                },
              },
            );
          }

          const text = step.querySelector("[data-process-text]");
          if (text) {
            gsap.from(text, {
              autoAlpha: 0,
              y: 32,
              duration: 1,
              ease: ease.out,
              scrollTrigger: { trigger: step, start: "top 85%", once: true },
            });
          }
        });

        return () => {
          triggers.forEach((trigger) => trigger.kill());
          steps.forEach((step) => (step.dataset.active = ""));
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
