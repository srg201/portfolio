"use client";

import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/animations/easings";
import { FINE_POINTER } from "@/components/motion/magnetic";
import { gsap, SplitText, useGSAP } from "@/lib/animations/gsap";

/** Символы перебора: ASCII, чтобы не выпадать из моноширинного шрифта */
const SCRAMBLE_CHARS = "01<>/#*+=_";
/** Пауза между сменами слова, с */
const WORD_HOLD = 1.8;
/** Максимальный сдвиг слоя с data-depth="1" при курсоре у края экрана, px */
const PARALLAX_SHIFT = { x: 28, y: 18 };

/**
 * clip-path, вырезающий из полноэкранного слоя ровно миниатюру шоурила.
 * Координаты считаются относительно липкой сцены, которая всегда на экране.
 */
function thumbInset(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-hero-stage]");
  const thumb = root.querySelector<HTMLElement>("[data-reel-thumb]");
  if (!stage || !thumb) return "inset(50% round 999px)";
  const s = stage.getBoundingClientRect();
  const t = thumb.getBoundingClientRect();
  return `inset(${t.top - s.top}px ${s.right - t.right}px ${s.bottom - t.bottom}px ${t.left - s.left}px round ${t.height / 2}px)`;
}

/**
 * Скролл-сцена шоурила (scrub): миниатюра раскрывается на весь экран,
 * контент hero уходит назад, затем короткая пауза на полном экране.
 */
function createReelScroll(root: HTMLElement, layer: HTMLElement) {
  const scene = root.closest<HTMLElement>("[data-hero-scene]") ?? root;
  const content = root.querySelector<HTMLElement>("[data-hero-content]");
  const caption = root.querySelector<HTMLElement>("[data-reel-caption]");

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  timeline.fromTo(
    layer,
    { clipPath: () => thumbInset(root) },
    {
      clipPath: "inset(0px 0px 0px 0px round 0px)",
      ease: "power2.inOut",
      duration: 0.6,
    },
    0,
  );
  if (content) {
    timeline.to(
      content,
      {
        autoAlpha: 0,
        scale: 0.94,
        yPercent: -4,
        ease: "power2.in",
        duration: 0.45,
      },
      0,
    );
  }
  if (caption) {
    timeline.to(caption, { autoAlpha: 1, duration: 0.12 }, 0.5);
  }
  // Пауза на полноэкранном видео перед тем, как сцена уедет
  timeline.to({}, { duration: 0.35 });

  return timeline;
}

/**
 * Анимация входа hero. Разметку рендерит сервер (hero.tsx), здесь только движение:
 * - [data-hero-name]: буквы имени поднимаются из-под маски строк;
 * - [data-reveal]: подписи, манифест, шоурил и CTA проявляются по очереди;
 * - [data-hero-word]: слово по кругу меняется перебором символов;
 * - [data-depth]: слои смещаются за курсором (параллакс), только мышь;
 * - [data-reel-layer]: при скролле сцены шоурил растёт от миниатюры до экрана.
 * До запуска элементы скрыты CSS-ом (globals.css, блок Hero), но только при
 * prefers-reduced-motion: no-preference; иначе всё видно сразу и без движения.
 */
export function HeroMotion({
  words,
  children,
}: {
  words: string[];
  children: ReactNode;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const name = root.querySelector<HTMLElement>("[data-hero-name]");
      const reveals = root.querySelectorAll<HTMLElement>("[data-reveal]");
      const word = root.querySelector<HTMLElement>("[data-hero-word]");
      if (!name) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(name, {
          type: "lines,chars",
          mask: "lines",
        });

        const intro = gsap.timeline({ defaults: { ease: ease.out } });

        intro
          .set(name, { autoAlpha: 1 })
          .from(split.chars, {
            yPercent: 115,
            rotate: 6,
            duration: 1.1,
            stagger: 0.03,
          })
          // После входа возвращаем исходную разметку: чище DOM, нет обрезки диакритики масками.
          // Чуть раньше конца: expo.out к этому моменту прошёл 99,6%, скачок меньше пикселя,
          // а имя целиком (элемент LCP) появляется в DOM на ~0,2 с раньше
          .call(() => split.revert(), [], "-=0.22")
          .fromTo(
            reveals,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 },
            0.45,
          );

        let cycle: gsap.core.Timeline | undefined;
        if (word && words.length > 1) {
          cycle = gsap.timeline({ repeat: -1, delay: intro.duration() });
          // Порядок смен: 2-е, 3-е, …, первое — и по кругу
          const sequence = [...words.slice(1), ...words.slice(0, 1)];
          sequence.forEach((text) => {
            cycle!.to(
              word,
              {
                duration: 0.9,
                ease: "none",
                scrambleText: {
                  text,
                  chars: SCRAMBLE_CHARS,
                  speed: 0.5,
                },
              },
              `+=${WORD_HOLD}`,
            );
          });
        }

        // Шоурил: после входа слой с видео проявляется поверх миниатюры,
        // и сцена начинает реагировать на скролл. Раньше нельзя: миниатюра
        // ещё едет в анимации входа, и её позиция была бы неверной
        let reel: gsap.core.Timeline | undefined;
        const layer = root.querySelector<HTMLElement>("[data-reel-layer]");
        if (layer) {
          gsap.set(layer, { clipPath: () => thumbInset(root) });
          intro.to(layer, { autoAlpha: 1, duration: 0.6 }).call(() => {
            reel = createReelScroll(root, layer);
          });
        }

        return () => {
          cycle?.kill();
          reel?.scrollTrigger?.kill();
          reel?.kill();
          split.revert();
        };
      });

      // Параллакс за курсором: слои с разной глубиной двигаются с разной силой
      mm.add(FINE_POINTER, () => {
        const layers = [
          ...root.querySelectorAll<HTMLElement>("[data-depth]"),
        ].map((element) => {
          const depth = Number(element.dataset.depth) || 0;
          const move = { duration: 1.2, ease: "power3.out" };
          return {
            depth,
            x: gsap.quickTo(element, "x", move),
            y: gsap.quickTo(element, "y", move),
          };
        });

        const onMove = (event: PointerEvent) => {
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          for (const layer of layers) {
            layer.x(nx * layer.depth * PARALLAX_SHIFT.x);
            layer.y(ny * layer.depth * PARALLAX_SHIFT.y);
          }
        };

        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([name, ...reveals], { autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope, dependencies: [words.join("\u0000")] },
  );

  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
