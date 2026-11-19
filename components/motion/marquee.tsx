"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";

/** Во сколько раз максимум ускоряется строка от скорости скролла */
const MAX_BOOST = 6;
/** Скорость скролла (px/с), дающая +1 к множителю */
const VELOCITY_UNIT = 300;
/** Насколько быстро скорость догоняет целевую (доля за кадр при 60 fps) */
const EASE = 0.08;

/**
 * Бесконечная бегущая строка.
 * - Две одинаковые копии содержимого: сдвиг на 50% замыкает петлю без шва.
 * - Скролл ускоряет строку и разворачивает её по направлению скролла.
 * - paused: плавно тормозит до остановки (кнопка паузы у секции, WCAG 2.2.2).
 * - Вне экрана не считается; в RTL едет в другую сторону.
 * - prefers-reduced-motion: стоит на месте.
 * Декоративная: aria-hidden, те же данные должны быть на странице текстом.
 */
export function Marquee({
  children,
  reverse = false,
  paused = false,
  duration = 40,
  className,
}: {
  children: ReactNode;
  /** Ехать в обратную сторону */
  reverse?: boolean;
  paused?: boolean;
  /** Секунд на один проход копии при скорости 1 */
  duration?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useGSAP(
    () => {
      const element = root.current;
      const track = element?.firstElementChild as HTMLElement | null;
      if (!element || !track) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rtl = getComputedStyle(element).direction === "rtl";
        const direction = (reverse ? 1 : -1) * (rtl ? -1 : 1);
        const setX = gsap.quickSetter(track, "xPercent");
        // В LTR лента прижата к левому краю и ездит в [-50%, 0],
        // в RTL прижата к правому, её диапазон зеркальный: [0, 50%]
        const wrap = rtl ? gsap.utils.wrap(0, 50) : gsap.utils.wrap(-50, 0);

        let x = 0;
        let speed = 1;
        let target = 1;
        let scrollDirection = 1;
        let visible = false;

        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (visible = self.isActive),
          onUpdate: (self) => {
            scrollDirection = self.direction;
            const boost = Math.min(
              1 + Math.abs(self.getVelocity()) / VELOCITY_UNIT,
              MAX_BOOST,
            );
            target = boost * scrollDirection;
          },
        });
        visible = trigger.isActive;

        const tick = (_time: number, deltaMs: number) => {
          if (!visible) return;
          const goal = pausedRef.current ? 0 : target;
          const frames = deltaMs / (1000 / 60);
          speed += (goal - speed) * (1 - Math.pow(1 - EASE, frames));
          // Ускорение от скролла гаснет само, направление остаётся
          target += (scrollDirection - target) * 0.04 * frames;
          x = wrap(x + (direction * speed * 50 * deltaMs) / 1000 / duration);
          setX(x);
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          trigger.kill();
          gsap.set(track, { clearProps: "transform" });
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [reverse, duration] },
  );

  return (
    <div ref={root} aria-hidden className={cn("overflow-hidden", className)}>
      <div className="flex w-max">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}
