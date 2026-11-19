"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/animations/gsap";
import { cn } from "@/lib/utils";

/** Только мышь и без prefers-reduced-motion: на таче магнит не нужен */
export const FINE_POINTER =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Магнитная обёртка: элемент тянется к курсору, пока тот над ним,
 * и пружинит обратно при уходе. Вложенный [data-magnetic-inner]
 * (например, кружок со стрелкой) тянется сильнее, что даёт глубину.
 */
export function Magnetic({
  children,
  strength = 0.3,
  innerStrength = 0.4,
  className,
}: {
  children: ReactNode;
  /** Доля смещения курсора от центра, на которую сдвигается элемент */
  strength?: number;
  innerStrength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(FINE_POINTER, () => {
        const inner = root.querySelector<HTMLElement>("[data-magnetic-inner]");
        const move = { duration: 0.6, ease: "power3.out" };
        const x = gsap.quickTo(root, "x", move);
        const y = gsap.quickTo(root, "y", move);
        const ix = inner ? gsap.quickTo(inner, "x", move) : undefined;
        const iy = inner ? gsap.quickTo(inner, "y", move) : undefined;

        const onMove = (event: PointerEvent) => {
          const rect = root.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          x(dx * strength);
          y(dy * strength);
          ix?.(dx * (innerStrength - strength));
          iy?.(dy * (innerStrength - strength));
        };

        const onLeave = () => {
          const back = { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" };
          gsap.to(root, back);
          if (inner) gsap.to(inner, back);
        };

        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        return () => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
          gsap.set(inner ? [root, inner] : root, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [strength, innerStrength] },
  );

  return (
    <span ref={ref} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}
