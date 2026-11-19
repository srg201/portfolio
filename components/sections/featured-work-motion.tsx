"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";
import { FINE_POINTER } from "@/components/motion/magnetic";

const MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * Движение секции работ.
 * - Фраза проявляется, обложки раскрываются clip-path при появлении,
 *   картинка внутри едет с лёгким параллаксом. Большая карточка без этого:
 *   в неё садится копия из спирали hero.
 * - Мышь: при наведении на карточку играет превью (грузится в этот момент).
 * - prefers-reduced-motion: ничего, вёрстка статичная.
 */
export function FeaturedWorkMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]", root);
      const reveals = gsap.utils.toArray<HTMLElement>(
        "[data-work-reveal]",
        root,
      );
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        gsap.from(reveals, {
          autoAlpha: 0,
          y: 32,
          duration: 1,
          ease: ease.out,
          stagger: 0.1,
          scrollTrigger: { trigger: reveals[0], start: "top 85%", once: true },
        });

        cards.forEach((card) => {
          // Большая карточка принимает перелёт из спирали hero: без своего входа
          if (card.hasAttribute("data-work-handoff")) return;
          const media = card.querySelector("[data-work-media]");
          const inner = card.querySelector("[data-work-parallax]");
          if (media) {
            gsap.fromTo(
              media,
              { clipPath: "inset(10% 8% 10% 8% round 2rem)" },
              {
                clipPath: "inset(0% 0% 0% 0% round 0.375rem)",
                duration: 1.3,
                ease: ease.out,
                scrollTrigger: { trigger: card, start: "top 88%", once: true },
              },
            );
          }
          if (inner) {
            gsap.fromTo(
              inner,
              { yPercent: -5 },
              {
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          }
        });
      });

      // Превью при наведении: только мышь, без reduced motion
      mm.add(FINE_POINTER, () => {
        const listeners = cards.map((card) => {
          const video = card.querySelector<HTMLVideoElement>(
            "[data-work-preview]",
          );
          const play = () => {
            if (!video) return;
            if (!video.src && video.dataset.src) video.src = video.dataset.src;
            video
              .play()
              .then(() => (video.dataset.playing = ""))
              .catch(() => {});
          };
          const stop = () => {
            if (!video) return;
            delete video.dataset.playing;
            video.pause();
          };
          card.addEventListener("pointerenter", play);
          card.addEventListener("pointerleave", stop);
          return () => {
            card.removeEventListener("pointerenter", play);
            card.removeEventListener("pointerleave", stop);
            stop();
          };
        });
        return () => listeners.forEach((remove) => remove());
      });

      // Картинки догружаются и меняют высоту страницы: пересчитать точки
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });

      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
      };
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
