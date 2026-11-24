"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animations/gsap";

/** Ключ в sessionStorage: preloader уже показан в этой сессии */
const KEY = "sb-preloaded";
/** Событие на window: preloader ушёл, можно запускать вход hero */
export const PRELOADER_DONE = "preloader:done";

/**
 * Скрипт до отрисовки (layout, next/script beforeInteractive): решает,
 * показывать ли preloader. Только первый заход в сессии и без reduced motion.
 * Ставит data-preloading на <html>, CSS по нему показывает оверлей.
 */
export const preloaderScript = `try{if(!sessionStorage.getItem("${KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("data-preloading","");sessionStorage.setItem("${KEY}","1")}}catch(e){}`;

/** Идёт ли сейчас preloader (для hero-motion: подождать с входом) */
export function isPreloading() {
  return document.documentElement.hasAttribute("data-preloading");
}

/**
 * Preloader первого захода: счётчик 0 → 100 и имя, затем экран уезжает
 * вверх и открывает hero. Без JS и при повторных заходах не показывается.
 */
export function Preloader({ name, label }: { name: string; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = root.current;
    if (!overlay || !isPreloading()) return;
    const value = { n: 0 };
    // Пишем в существующий текстовый узел: он принадлежит React
    const write = () => {
      const node = counter.current?.firstChild;
      if (node?.nodeType === Node.TEXT_NODE) {
        node.nodeValue = String(Math.round(value.n)).padStart(3, "0");
      }
    };
    const finish = () => {
      document.documentElement.removeAttribute("data-preloading");
      window.dispatchEvent(new Event(PRELOADER_DONE));
    };
    const timeline = gsap
      .timeline()
      .from(overlay.querySelectorAll("[data-preloader-char]"), {
        yPercent: 110,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.025,
      })
      .to(value, { n: 100, duration: 1.4, ease: "power2.inOut", onUpdate: write }, 0)
      .to(overlay.querySelector("[data-preloader-bar]"), { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(overlay, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.9,
        ease: "expo.inOut",
      })
      // Hero начинает вход, пока экран ещё уезжает
      .call(finish, [], "-=0.55");
    return () => {
      timeline.kill();
      finish();
    };
  }, []);

  return (
    <div
      ref={root}
      data-preloader
      role="status"
      aria-label={label}
      className="fixed inset-0 z-[60] hidden flex-col justify-between bg-background px-4 pt-5 pb-8 [clip-path:inset(0%_0%_0%_0%)] min-[400px]:px-5 sm:px-6 md:px-10 md:pt-8 md:pb-10"
    >
      <span aria-hidden className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <p
        aria-hidden
        className="flex flex-wrap overflow-hidden text-[clamp(3rem,10vw,9rem)] leading-none font-light tracking-[-0.05em]"
      >
        {[...name].map((char, index) => (
          <span key={index} data-preloader-char className="inline-block whitespace-pre">
            {char}
          </span>
        ))}
      </p>
      <div aria-hidden className="flex flex-col gap-4">
        <span
          ref={counter}
          dir="ltr"
          className="font-mono text-[clamp(2.5rem,7vw,5rem)] leading-none text-brand tabular-nums"
        >
          000
        </span>
        <span className="h-px w-full bg-border">
          <span data-preloader-bar className="block h-full origin-left scale-x-0 bg-brand rtl:origin-right" />
        </span>
      </div>
    </div>
  );
}
