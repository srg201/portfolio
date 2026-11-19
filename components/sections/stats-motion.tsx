"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";

/**
 * Появление секции цифр: числа досчитывают от нуля, заголовок
 * поднимается по строкам, подписи проявляются. Один раз, при входе в экран.
 * prefers-reduced-motion: ничего не делаем, в HTML уже финальные значения.
 */
export function StatsMotion({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const number = new Intl.NumberFormat(locale);
        const counters = gsap.utils.toArray<HTMLElement>("[data-count]", root);
        const reveals = gsap.utils.toArray<HTMLElement>(
          "[data-stats-reveal]",
          root,
        );
        const title = root.querySelector<HTMLElement>("[data-stats-title]");

        // Меняем значение существующего текстового узла, а не textContent:
        // узел принадлежит React, подмена сломала бы ему следующие обновления
        const write = (el: HTMLElement, value: number) => {
          const node = el.firstChild;
          if (node?.nodeType !== Node.TEXT_NODE) return;
          node.nodeValue = number.format(value) + (el.dataset.suffix ?? "");
        };

        counters.forEach((el) => write(el, 0));
        gsap.set(reveals, { autoAlpha: 0, y: 16 });

        let split: SplitText | undefined;
        if (title) {
          split = SplitText.create(title, { type: "lines", mask: "lines" });
          gsap.set(split.lines, { yPercent: 110 });
        }

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: "top 70%",
          once: true,
          onEnter: () => {
            counters.forEach((el, index) => {
              const target = Number(el.dataset.count);
              const state = { value: 0 };
              gsap.to(state, {
                value: target,
                duration: index === 0 ? 2.4 : 1.8,
                delay: index === 0 ? 0 : 0.4 + index * 0.15,
                ease: ease.out,
                onUpdate: () => write(el, Math.round(state.value)),
              });
            });
            gsap.to(reveals, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: ease.out,
              stagger: 0.12,
              delay: 0.2,
            });
            if (split) {
              gsap.to(split.lines, {
                yPercent: 0,
                duration: 1.2,
                ease: ease.out,
                stagger: 0.1,
                delay: 0.3,
                onComplete: () => split?.revert(),
              });
            }
          },
        });

        return () => {
          trigger.kill();
          split?.revert();
          counters.forEach((el) => write(el, Number(el.dataset.count)));
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [locale] },
  );

  return <div ref={ref}>{children}</div>;
}
