"use client";

import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/animations/easings";
import { FINE_POINTER } from "@/components/motion/magnetic";
import { isPreloading, PRELOADER_DONE } from "@/components/motion/preloader";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/animations/gsap";
import { createRing, pickHandoff, type Ring } from "./ring-motion";

/** Символы перебора: ASCII, чтобы не выпадать из моноширинного шрифта */
const SCRAMBLE_CHARS = "01<>/#*+=_";
/** Пауза между сменами слова, с */
const WORD_HOLD = 1.8;
/** Максимальный сдвиг слоя с data-depth="1" при курсоре у края экрана, px */
const PARALLAX_SHIFT = { x: 28, y: 18 };
/** Скорость вращения карусели, оборотов в секунду */
const DRIFT = 0.01;
/** Сколько оборота добавляет прокрутка на один экран */
const SCROLL_SPIN = 0.2;

/**
 * Вращение карусели: дрейф плюс прокрутка. Крутится, только пока
 * карусель на экране и не разлетается.
 */
function startRingSpin(ring: Ring) {
  let drift = 0;
  const tick = (_time: number, deltaMs: number) => {
    if (ring.stage.getBoundingClientRect().bottom <= 0) return;
    if (ring.state.scatter === 0) drift += (DRIFT * deltaMs) / 1000;
    ring.state.shift = drift + (window.scrollY / window.innerHeight) * SCROLL_SPIN;
    ring.apply();
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

/**
 * Перелёт в секцию работ. Пока первая карточка работ [data-work-handoff]
 * поднимается от низа экрана, карусель разлетается, а копия карточки первой
 * работы [data-ring-proxy] летит из карусели ровно в эту карточку. Оба
 * прямоугольника меряются каждый кадр, поэтому стык точный при любой
 * скорости скролла. В конце копия прячется, видна настоящая карточка.
 */
function createHandoff(root: HTMLElement, ring: Ring) {
  const scene = root.closest<HTMLElement>("[data-hero-scene]");
  const proxy = scene?.querySelector<HTMLElement>("[data-ring-proxy]");
  const target = document.querySelector<HTMLElement>(
    "[data-work-handoff] [data-work-media]",
  );
  if (!proxy || !target) return () => {};

  const fly = gsap.parseEase("power2.inOut");
  const spread = gsap.parseEase("power2.in");
  const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;

  const update = (progress: number) => {
    const state = ring.state;
    if (progress <= 0) state.handoff = null;
    else if (!state.handoff) state.handoff = pickHandoff(ring);
    state.scatter = spread(Math.min(1, progress / 0.5));
    ring.apply();

    const card = state.handoff?.querySelector<HTMLElement>("[data-ring-inner]");
    if (!card || progress <= 0 || progress >= 1) {
      proxy.style.visibility = "hidden";
      target.style.visibility = "";
      return;
    }
    const from = card.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const e = fly(progress);
    const mix = (a: number, b: number) => a + (b - a) * e;
    Object.assign(proxy.style, {
      visibility: "visible",
      left: `${mix(from.left, to.left)}px`,
      top: `${mix(from.top, to.top)}px`,
      width: `${mix(from.width, to.width)}px`,
      height: `${mix(from.height, to.height)}px`,
      borderRadius: `${mix(6, radius)}px`,
    });
    target.style.visibility = "hidden";
  };

  const trigger = ScrollTrigger.create({
    trigger: target,
    start: "top bottom",
    end: "top 12%",
    invalidateOnRefresh: true,
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  });

  return () => {
    trigger.kill();
    proxy.style.visibility = "hidden";
    target.style.visibility = "";
  };
}

/**
 * Анимация hero. Разметку рендерит сервер (hero.tsx), здесь только движение:
 * - [data-hero-intro]: орбита и метки появляются первыми;
 * - [data-hero-name]: буквы имени поднимаются из-под маски строк;
 * - [data-reveal]: подписи, слово и CTA проявляются по очереди;
 * - [data-hero-word]: слово по кругу меняется перебором символов;
 * - [data-ring]: карточки карусели прилетают из глубины, кольцо вращается
 *   (дрейф и скролл), при уходе со сцены разлетается, и карточка первой
 *   работы перелетает в секцию работ;
 * - [data-depth]: слои смещаются за курсором (параллакс), только мышь.
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
      const intros = root.querySelectorAll<HTMLElement>("[data-hero-intro]");
      const orbit = root.querySelector<HTMLElement>("[data-hero-orbit]");
      const word = root.querySelector<HTMLElement>("[data-hero-word]");
      if (!name) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(name, {
          type: "lines,chars",
          mask: "lines",
        });
        const ring = createRing(root);
        const inners = ring
          ? ring.cards
              .map((card) => card.querySelector<HTMLElement>("[data-ring-inner]"))
              .filter((inner): inner is HTMLElement => !!inner)
          : [];

        const intro = gsap.timeline({ defaults: { ease: ease.out } });

        intro
          .set([...intros], { autoAlpha: 1 })
          .from(intros, { autoAlpha: 0, duration: 1, stagger: 0.05 }, 0.2);
        if (orbit) {
          intro.from(
            orbit,
            { scale: 0.82, rotate: -30, duration: 1.8, ease: ease.out },
            0,
          );
        }

        intro
          .set(name, { autoAlpha: 1 }, 0.15)
          .from(
            split.chars,
            { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.03 },
            0.15,
          )
          // После входа возвращаем исходную разметку: чище DOM, нет обрезки диакритики масками.
          // Чуть раньше конца: expo.out к этому моменту прошёл 99,6%, скачок меньше пикселя,
          // а имя целиком (элемент LCP) появляется в DOM на ~0,2 с раньше
          .call(() => split.revert(), [], "-=0.22")
          .fromTo(
            reveals,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 },
            0.45,
          )
          // Карточки карусели прилетают из глубины по очереди
          .fromTo(
            inners,
            { autoAlpha: 0, scale: 0.5 },
            { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.06 },
            0.5,
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

        // Первый заход: preloader закрывает экран, вход ждёт его ухода
        const waiting = isPreloading();
        const start = () => {
          intro.play();
          cycle?.play();
        };
        if (waiting) {
          intro.pause();
          cycle?.pause();
          window.addEventListener(PRELOADER_DONE, start, { once: true });
        }

        const stopSpin = ring ? startRingSpin(ring) : () => {};
        const stopHandoff = ring ? createHandoff(root, ring) : () => {};

        return () => {
          window.removeEventListener(PRELOADER_DONE, start);
          cycle?.kill();
          stopSpin();
          stopHandoff();
          split.revert();
        };
      });

      // Мышь: параллакс слоёв
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
        gsap.set([name, ...reveals, ...intros], { autoAlpha: 1 });
        // Статичное кольцо: раскладываем сразу и при смене размера
        const ring = createRing(root);
        if (!ring) return;
        window.addEventListener("resize", ring.apply);
        return () => window.removeEventListener("resize", ring.apply);
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
