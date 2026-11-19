"use client";

import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/animations/easings";
import { FINE_POINTER } from "@/components/motion/magnetic";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/animations/gsap";
import { createRing, pickHandoff, type Ring } from "./ring-motion";

/** Символы перебора: ASCII, чтобы не выпадать из моноширинного шрифта */
const SCRAMBLE_CHARS = "01<>/#*+=_";
/** Пауза между сменами слова, с */
const WORD_HOLD = 1.8;
/** Максимальный сдвиг слоя с data-depth="1" при курсоре у края экрана, px */
const PARALLAX_SHIFT = { x: 28, y: 18 };

type Box = { top: number; right: number; bottom: number; left: number };

/** Прямоугольник элемента относительно липкой сцены (она всегда на экране) */
function boxIn(root: HTMLElement, selector: string): Box | null {
  const stage = root.querySelector<HTMLElement>("[data-hero-stage]");
  const element = root.querySelector<HTMLElement>(selector);
  if (!stage || !element) return null;
  const s = stage.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  return {
    top: e.top - s.top,
    right: s.right - e.right,
    bottom: s.bottom - e.bottom,
    left: e.left - s.left,
  };
}

/**
 * Первая карточка спирали (шоурил) в положении shift = 0, перед зрителем:
 * в неё сжимается видео. Сдвиг на время замера обнуляем.
 */
function ringReelBox(root: HTMLElement, ring: Ring): Box {
  const previous = ring.state.shift;
  ring.state.shift = 0;
  ring.apply();
  const box = boxIn(root, "[data-ring-reel] [data-ring-inner]");
  ring.state.shift = previous;
  ring.apply();
  return box ?? cardBox();
}

/** Окно шоурила на оси: из полноэкранного слоя вырезаем ровно его */
function thumbBox(root: HTMLElement): Box {
  return (
    boxIn(root, "[data-reel-thumb]") ?? {
      top: innerHeight / 2,
      right: innerWidth / 2,
      bottom: innerHeight / 2,
      left: innerWidth / 2,
    }
  );
}

/** Раскрытая карточка: поля по краям, снизу место под Dock */
function cardBox(): Box {
  const width = innerWidth;
  const height = innerHeight;
  const side = Math.max(16, width * 0.07);
  return {
    top: Math.max(72, height * 0.12),
    right: side,
    bottom: Math.max(104, height * 0.15),
    left: side,
  };
}

const inset = (box: Box, radius: number) =>
  `inset(${box.top}px ${box.right}px ${box.bottom}px ${box.left}px round ${radius}px)`;

/** Сдвиг центра прямоугольника от центра сцены: туда ставим HUD с кнопкой */
const centerOffset = (box: Box) => ({
  x: (box.left - box.right) / 2,
  y: (box.top - box.bottom) / 2,
});

/**
 * Скролл-сцена (scrub): окно на оси растёт в большую карточку, HUD с кнопкой
 * play едет за центром окна, контент hero уходит назад. Потом карточка
 * сжимается в спираль проектов, и скролл двигает карточки по спирали.
 */
function createReelScroll(root: HTMLElement, layer: HTMLElement) {
  const scene = root.closest<HTMLElement>("[data-hero-scene]") ?? root;
  const content = root.querySelector<HTMLElement>("[data-hero-content]");
  const hud = root.querySelector<HTMLElement>("[data-reel-hud]");
  const captions = root.querySelectorAll<HTMLElement>("[data-reel-caption]");
  const handoffTarget = document.querySelector<HTMLElement>(
    "[data-work-handoff] [data-work-media]",
  );

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      // Сцена спирали кончается там, где начинается перелёт в работы
      ...(handoffTarget
        ? { endTrigger: handoffTarget, end: "top bottom" }
        : { end: "bottom bottom" }),
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  timeline.fromTo(
    layer,
    { clipPath: () => inset(thumbBox(root), 12) },
    {
      clipPath: () => inset(cardBox(), 28),
      ease: "power2.inOut",
      duration: 0.6,
    },
    0,
  );
  if (hud) {
    timeline.fromTo(
      hud,
      {
        x: () => centerOffset(thumbBox(root)).x,
        y: () => centerOffset(thumbBox(root)).y,
      },
      {
        x: () => centerOffset(cardBox()).x,
        y: () => centerOffset(cardBox()).y,
        ease: "power2.inOut",
        duration: 0.6,
      },
      0,
    );
  }
  if (content) {
    timeline.to(
      content,
      {
        autoAlpha: 0,
        scale: 0.94,
        ease: "power2.in",
        duration: 0.45,
      },
      0,
    );
  }
  if (captions.length) {
    timeline.to(captions, { autoAlpha: 1, duration: 0.12 }, 0.45);
  }

  // Карточка шоурила сжимается в первую карточку спирали проектов
  const ring = createRing(root);
  const reelCard = root.querySelector<HTMLElement>(
    "[data-ring-reel] [data-ring-inner]",
  );
  const texts = root.querySelectorAll<HTMLElement>("[data-ring-text]");
  const corners = root.querySelectorAll<HTMLElement>("[data-ring-corner]");
  const spin = { scroll: 0, drift: 0, driftOn: 0 };

  if (ring) {
    const others = ring.cards
      .map((card) => card.querySelector<HTMLElement>("[data-ring-inner]"))
      .filter((inner): inner is HTMLElement => !!inner && inner !== reelCard);
    const SHRINK = 0.9;
    timeline.to(
      layer,
      {
        clipPath: () => inset(ringReelBox(root, ring), 6),
        ease: "power2.inOut",
        duration: 0.5,
      },
      SHRINK,
    );
    if (hud) timeline.to(hud, { autoAlpha: 0, duration: 0.15 }, SHRINK);
    timeline
      .to(ring.stage, { autoAlpha: 1, duration: 0.2 }, SHRINK)
      // Остальные карточки прилетают из глубины по очереди
      .fromTo(
        others,
        { autoAlpha: 0, scale: 0.4 },
        { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.025 },
        SHRINK + 0.1,
      );
    if (reelCard) {
      timeline.fromTo(
        reelCard,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05 },
        SHRINK + 0.42,
      );
    }
    timeline
      .to(layer, { autoAlpha: 0, duration: 0.08 }, SHRINK + 0.47)
      .fromTo(
        texts,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06 },
        SHRINK + 0.45,
      )
      .fromTo(
        corners,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3 },
        SHRINK + 0.5,
      )
      // Скролл двигает карточки по спирали, после сборки включается дрейф
      .to(spin, { scroll: 0.45, duration: 1.6 }, SHRINK + 0.5)
      .to(spin, { driftOn: 1, duration: 0.3 }, SHRINK + 0.5);
  } else {
    timeline.to({}, { duration: 0.35 });
  }

  return { timeline, spin, ring };
}

/** Медленный дрейф спирали, пока она на экране и не разлетается */
function startRingSpin(
  ring: Ring,
  spin: { scroll: number; drift: number; driftOn: number },
) {
  const DRIFT = 0.008; // доля пути в секунду

  const tick = (_time: number, deltaMs: number) => {
    if (Number(gsap.getProperty(ring.stage, "autoAlpha")) <= 0) return;
    if (ring.stage.getBoundingClientRect().bottom <= 0) return;
    if (ring.state.scatter === 0) spin.drift += (DRIFT * deltaMs) / 1000;
    ring.state.shift = spin.scroll + spin.drift * spin.driftOn;
    ring.apply();
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}

/**
 * Перелёт в секцию работ. Секция работ заезжает на последний экран сцены
 * (отрицательный отступ, featured-work.tsx), и пока её первая карточка
 * поднимается от низа экрана до своего места, спираль разлетается на камеру,
 * тексты уходят, а копия карточки первой работы [data-ring-proxy] летит из
 * спирали ровно в эту карточку. Оба прямоугольника меряются каждый кадр,
 * поэтому стык точный при любой скорости скролла. В конце копия прячется,
 * видна настоящая карточка.
 */
function createHandoff(root: HTMLElement, ring: Ring) {
  const scene = root.closest<HTMLElement>("[data-hero-scene]");
  const proxy = scene?.querySelector<HTMLElement>("[data-ring-proxy]");
  const target = document.querySelector<HTMLElement>(
    "[data-work-handoff] [data-work-media]",
  );
  if (!scene || !proxy || !target) return null;

  const fade = [
    ...root.querySelectorAll<HTMLElement>("[data-ring-text]"),
    ...root.querySelectorAll<HTMLElement>("[data-ring-corner]"),
  ];
  const fly = gsap.parseEase("power2.inOut");
  const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;

  let faded = false;
  const update = (progress: number) => {
    const state = ring.state;
    if (progress <= 0) {
      state.handoff = null;
    } else if (!state.handoff) {
      state.handoff = pickHandoff(ring);
    }
    state.scatter = gsap.parseEase("power2.in")(Math.min(1, progress / 0.85));
    ring.apply();

    // Тексты гаснут в начале перелёта. До него ими управляет сцена:
    // трогаем их, только если перелёт уже начинался
    if (progress > 0 || faded) {
      const out = Math.min(1, progress / 0.3);
      gsap.set(fade, { autoAlpha: 1 - out, y: -24 * out });
      faded = progress > 0;
    }

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
    endTrigger: scene,
    end: "bottom bottom",
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
 * - [data-hero-intro]: орбита, ось и метки появляются первыми;
 * - [data-hero-name]: буквы имени поднимаются из-под маски строк;
 * - [data-reveal]: подписи, слово, окно шоурила и CTA проявляются по очереди;
 * - [data-hero-word]: слово по кругу меняется перебором символов;
 * - [data-depth]: слои смещаются за курсором (параллакс), только мышь;
 * - [data-hero-coord]: числа на оси следуют за курсором;
 * - [data-reel-layer]: при скролле окно шоурила растёт в карточку,
 *   затем сжимается в первую карточку спирали проектов [data-ring];
 *   спираль движется скроллом и дрейфом, в конце разлетается, а карточка
 *   первой работы перелетает в секцию работ (createHandoff).
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
      const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
      const orbit = root.querySelector<HTMLElement>("[data-hero-orbit]");
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
          .set([...intros], { autoAlpha: 1 })
          .from(lines, { scaleX: 0, duration: 1.4, ease: ease.inOut }, 0)
          .from(
            [...intros].filter(
              (element) => !element.hasAttribute("data-hero-line"),
            ),
            { autoAlpha: 0, duration: 1, stagger: 0.05 },
            0.2,
          );
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

        // Шоурил: после входа слой с видео проявляется поверх окна,
        // и сцена начинает реагировать на скролл. Раньше нельзя: окно
        // ещё едет в анимации входа, и его позиция была бы неверной
        let reel: gsap.core.Timeline | undefined;
        let stopSpin = () => {};
        const layer = root.querySelector<HTMLElement>("[data-reel-layer]");
        if (layer) {
          intro
            .call(() => {
              const scene = createReelScroll(root, layer);
              reel = scene.timeline;
              if (scene.ring) {
                const stop = startRingSpin(scene.ring, scene.spin);
                const stopHandoff = createHandoff(root, scene.ring);
                stopSpin = () => {
                  stop();
                  stopHandoff?.();
                };
              }
            })
            .to(layer, { autoAlpha: 1, duration: 0.6 });
        }

        return () => {
          cycle?.kill();
          stopSpin();
          reel?.scrollTrigger?.kill();
          reel?.kill();
          split.revert();
        };
      });

      // Мышь: параллакс слоёв и координаты на оси
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

        // Числа у концов оси: широта по вертикали курсора, долгота по горизонтали.
        // Пишем в существующий текстовый узел: он принадлежит React
        const coords = [
          ...root.querySelectorAll<HTMLElement>("[data-hero-coord]"),
        ];
        const value = { x: 0, y: 0 };
        const writeCoords = () => {
          for (const element of coords) {
            const node = element.firstChild;
            if (node?.nodeType !== Node.TEXT_NODE) continue;
            const v = element.dataset.heroCoord === "x" ? value.x : value.y;
            node.nodeValue = v.toFixed(4);
          }
        };
        const coordX = gsap.quickTo(value, "x", {
          duration: 1.2,
          ease: "power3.out",
          onUpdate: writeCoords,
        });
        const coordY = gsap.quickTo(value, "y", {
          duration: 1.2,
          ease: "power3.out",
          onUpdate: writeCoords,
        });

        const onMove = (event: PointerEvent) => {
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          for (const layer of layers) {
            layer.x(nx * layer.depth * PARALLAX_SHIFT.x);
            layer.y(ny * layer.depth * PARALLAX_SHIFT.y);
          }
          coordX(nx * 180);
          coordY(-ny * 90);
        };

        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([name, ...reveals, ...intros], { autoAlpha: 1 });
        // Статичная спираль: раскладываем один раз и при смене размера
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
