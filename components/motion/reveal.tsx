"use client";

import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/animations/easings";
import { gsap, useGSAP } from "@/lib/animations/gsap";

/**
 * Появление при прокрутке: элементы [data-reveal-item] внутри поднимаются
 * и проявляются по очереди, когда блок входит в экран. Один раз.
 * prefers-reduced-motion: ничего не делает, всё видно сразу.
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = root.querySelectorAll<HTMLElement>("[data-reveal-item]");
        gsap.from(items, {
          autoAlpha: 0,
          y: 32,
          duration: 1,
          ease: ease.out,
          stagger,
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [stagger] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
