"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/animations/gsap";

/**
 * Псевдо-лог деплоя для 404: строки печатаются по очереди перебором
 * символов, последняя падает с ошибкой, затем проявляются ссылки.
 * prefers-reduced-motion: всё видно сразу.
 */
export function NotFoundLog({
  path,
  lines,
  children,
}: {
  path: string;
  lines: { build: string; deploy: string; error: string };
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = root.querySelectorAll<HTMLElement>("[data-log-line]");
        const timeline = gsap.timeline({ delay: 0.3 });
        rows.forEach((row) => {
          const text = row.querySelector<HTMLElement>("[data-log-text]");
          timeline.from(row, { autoAlpha: 0, duration: 0.01 });
          if (text) {
            timeline.from(text, {
              duration: 0.6,
              scrambleText: { text: "", chars: "01<>/#*+=_", speed: 0.6 },
            });
          }
          timeline.to({}, { duration: 0.25 });
        });
        timeline.from(root.querySelectorAll("[data-log-after]"), {
          autoAlpha: 0,
          y: 20,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.08,
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const row = "flex gap-3";
  return (
    <div ref={ref} className="flex flex-col gap-10">
      <pre
        dir="ltr"
        className="overflow-x-auto rounded-md border bg-background/50 p-5 font-mono text-xs leading-relaxed text-muted-foreground backdrop-blur sm:p-6 sm:text-sm"
      >
        <span data-log-line className={row}>
          <span aria-hidden className="text-brand">$</span>
          <span data-log-text>{`deploy ${path}`}</span>
        </span>
        {"\n"}
        <span data-log-line className={row}>
          <span aria-hidden className="text-success">✓</span>
          <span data-log-text>{lines.build}</span>
        </span>
        {"\n"}
        <span data-log-line className={row}>
          <span aria-hidden className="text-success">✓</span>
          <span data-log-text>{lines.deploy}</span>
        </span>
        {"\n"}
        <span data-log-line className={`${row} text-destructive`}>
          <span aria-hidden>✕</span>
          <span data-log-text>{lines.error}</span>
        </span>
      </pre>
      {children}
    </div>
  );
}
