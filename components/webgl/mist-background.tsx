"use client";

import { useEffect, useRef, useState } from "react";
import { mistFragment, mistVertex } from "./shaders/mist";

type Rgb = [number, number, number];

/** Сила тумана по теме: на светлом фоне он мягче */
const INTENSITY = { dark: 1, light: 0.55 } as const;
/** Скорость, с которой цвета догоняют новую тему (доля за кадр) */
const COLOR_LERP = 0.06;
const MOUSE_LERP = 0.05;

/**
 * Любой CSS-цвет (в т.ч. oklch из токенов) → линейные 0..1 RGB.
 * Браузер сам переводит цвет в sRGB, когда рисует его на 2D-канвасе.
 */
function cssColorToRgb(context: CanvasRenderingContext2D, value: string): Rgb {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255];
}

function readThemeColors(context: CanvasRenderingContext2D) {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    bg: cssColorToRgb(context, token("--background")),
    brand: cssColorToRgb(context, token("--brand")),
    cool: cssColorToRgb(context, token("--chart-3")),
    intensity: document.documentElement.classList.contains("dark")
      ? INTENSITY.dark
      : INTENSITY.light,
  };
}

/**
 * Фон всего сайта: живой WebGL-туман (OGL). Один canvas на layout,
 * под ним CSS-градиент: он виден, пока WebGL грузится, и если WebGL недоступен.
 * - цвета берутся из токенов темы и плавно перетекают при её смене;
 * - курсор подсвечивает туман (только мышь), скролл сдвигает поле;
 * - мобила: меньше разрешение и октав, ~30 fps;
 * - prefers-reduced-motion: один статичный кадр без анимации;
 * - вкладка в фоне: рендер на паузе.
 */
export function MistBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      if (disposed) return;

      const reducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const finePointer = matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const small = matchMedia("(max-width: 767px)").matches || !finePointer;

      let renderer: InstanceType<typeof Renderer>;
      try {
        renderer = new Renderer({
          // Туман размытый: полное разрешение не нужно, а на GPU это дёшево
          dpr: small ? 0.35 : 0.5,
          alpha: false,
          antialias: false,
          depth: false,
          powerPreference: "low-power",
        });
      } catch {
        return; // WebGL недоступен: остаётся CSS-градиент
      }

      const gl = renderer.gl;
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "absolute inset-0 size-full";
      container.appendChild(canvas);

      const probe = document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
      })!;
      let target = readThemeColors(probe);

      const program = new Program(gl, {
        vertex: mistVertex,
        fragment: mistFragment(small ? 4 : 6),
        uniforms: {
          uTime: { value: Math.random() * 100 },
          uAspect: { value: 1 },
          uScroll: { value: 0 },
          uIntensity: { value: target.intensity },
          uMouse: { value: [0.5, 0.5] },
          uMouseActive: { value: 0 },
          uBg: { value: [...target.bg] },
          uBrand: { value: [...target.brand] },
          uCool: { value: [...target.cool] },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      const u = program.uniforms;

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        u.uAspect.value = window.innerWidth / window.innerHeight;
      };
      resize();

      // Смена темы: next-themes меняет класс на <html>
      const themeObserver = new MutationObserver(() => {
        target = readThemeColors(probe);
        if (reducedMotion) applyColors(1);
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      function applyColors(amount: number) {
        const lerp = (from: number[], to: Rgb) => {
          for (let i = 0; i < 3; i++) from[i]! += (to[i]! - from[i]!) * amount;
        };
        lerp(u.uBg.value, target.bg);
        lerp(u.uBrand.value, target.brand);
        lerp(u.uCool.value, target.cool);
        u.uIntensity.value += (target.intensity - u.uIntensity.value) * amount;
      }

      const mouse = { x: 0.5, y: 0.5, active: 0 };
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        mouse.x = event.clientX / window.innerWidth;
        mouse.y = 1 - event.clientY / window.innerHeight;
        mouse.active = 1;
      };
      const onPointerLeave = () => (mouse.active = 0);

      const render = () => {
        u.uScroll.value = window.scrollY / window.innerHeight;
        renderer.render({ scene: mesh });
      };

      let frame = 0;
      let last = performance.now();
      const minFrameMs = small ? 1000 / 30 : 0;

      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        const delta = now - last;
        if (delta < minFrameMs) return;
        last = now;

        u.uTime.value += Math.min(delta, 100) / 1000;
        applyColors(COLOR_LERP);
        const [mx, my] = u.uMouse.value as number[];
        u.uMouse.value = [
          mx! + (mouse.x - mx!) * MOUSE_LERP,
          my! + (mouse.y - my!) * MOUSE_LERP,
        ];
        u.uMouseActive.value +=
          (mouse.active - u.uMouseActive.value) * MOUSE_LERP;
        render();
      };

      const onVisibility = () => {
        cancelAnimationFrame(frame);
        if (!document.hidden && !reducedMotion) {
          last = performance.now();
          frame = requestAnimationFrame(loop);
        }
      };

      const onResize = () => {
        resize();
        if (reducedMotion) render();
      };

      window.addEventListener("resize", onResize);
      if (reducedMotion) {
        render();
      } else {
        window.addEventListener("pointermove", onPointerMove, {
          passive: true,
        });
        document.documentElement.addEventListener(
          "pointerleave",
          onPointerLeave,
        );
        document.addEventListener("visibilitychange", onVisibility);
        frame = requestAnimationFrame(loop);
      }
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        themeObserver.disconnect();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave,
        );
        document.removeEventListener("visibilitychange", onVisibility);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      data-ready={ready || undefined}
      className="mist-background pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    />
  );
}
