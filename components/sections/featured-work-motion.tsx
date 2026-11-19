"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";
import { FINE_POINTER } from "@/components/motion/magnetic";

const DESKTOP = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

/**
 * Движение секции работ.
 * - Десктоп: секция закрепляется, лента едет по горизонтали (в RTL в другую
 *   сторону), обложки раскрываются clip-path, картинка внутри с параллаксом,
 *   снизу полоса прогресса. Tab на карточке за краем экрана докручивает до неё.
 * - Мобила: обложки раскрываются при появлении.
 * - Мышь: при наведении на карточку играет превью (грузится в этот момент).
 * - prefers-reduced-motion: ничего, вёрстка статичная.
 */
export function FeaturedWorkMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const pin = root?.querySelector<HTMLElement>("[data-work-pin]");
      const viewport = root?.querySelector<HTMLElement>("[data-work-viewport]");
      const track = root?.querySelector<HTMLElement>("[data-work-track]");
      if (!root || !pin || !viewport || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-work-card]", root);
      const reveals = gsap.utils.toArray<HTMLElement>("[data-work-reveal]", root);
      const mm = gsap.matchMedia();

      mm.add(DESKTOP, () => {
        const rtl = getComputedStyle(track).direction === "rtl";
        const sign = rtl ? 1 : -1;
        // Overflow-clip: браузер не сможет сам прокрутить рамку фокусом
        viewport.dataset.ready = "";
        viewport.scrollLeft = 0;
        const distance = () => track.scrollWidth - viewport.clientWidth;
        const progress = root.querySelector<HTMLElement>("[data-work-progress]");
        const setProgress = progress
          ? gsap.quickSetter(progress, "scaleX")
          : () => {};

        const slide = gsap.to(track, {
          x: () => sign * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });

        gsap.from(reveals, {
          autoAlpha: 0,
          y: 32,
          duration: 1,
          ease: ease.out,
          stagger: 0.1,
          scrollTrigger: { trigger: pin, start: "top 70%", once: true },
        });

        // Карточка «въезжает» с того края, откуда идёт лента
        const enter = rtl ? "right left" : "left right";
        const leave = rtl ? "left right" : "right left";
        cards.forEach((card) => {
          const media = card.querySelector("[data-work-media]");
          const inner = card.querySelector("[data-work-parallax]");
          if (media) {
            gsap.fromTo(
              media,
              { clipPath: "inset(14% 10% 14% 10% round 3rem)" },
              {
                clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: slide,
                  start: enter,
                  end: "center center",
                  scrub: true,
                },
              },
            );
          }
          if (inner) {
            gsap.fromTo(
              inner,
              { xPercent: -sign * 6, scale: 1.14 },
              {
                xPercent: sign * 6,
                scale: 1.14,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: slide,
                  start: enter,
                  end: leave,
                  scrub: true,
                },
              },
            );
          }
        });

        // Tab к карточке за краем: прокручиваем страницу так, чтобы лента
        // доехала до неё (сама лента не прокручивается, она двигается скроллом)
        const onFocus = (event: FocusEvent) => {
          const card = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-work-card]",
          );
          const trigger = slide.scrollTrigger;
          if (!card || !trigger) return;
          const offset = rtl
            ? track.offsetWidth - (card.offsetLeft + card.offsetWidth)
            : card.offsetLeft;
          const target = Math.min(
            Math.max(offset - viewport.clientWidth * 0.15, 0),
            distance(),
          );
          window.scrollTo({ top: trigger.start + target, behavior: "instant" });
        };
        track.addEventListener("focusin", onFocus);

        return () => {
          track.removeEventListener("focusin", onFocus);
          delete viewport.dataset.ready;
        };
      });

      mm.add(MOBILE, () => {
        cards.forEach((card) => {
          const media = card.querySelector("[data-work-media]");
          if (!media) return;
          gsap.fromTo(
            media,
            { clipPath: "inset(8% 6% 8% 6% round 2.5rem)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
              duration: 1.2,
              ease: ease.out,
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
            },
          );
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
