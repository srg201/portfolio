"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const query = matchMedia(REDUCED);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(REDUCED).matches,
    () => false,
  );
}

/** Network Information API есть не во всех браузерах и не в lib.dom */
function saveData() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return connection?.saveData === true;
}

/**
 * Видео шоурила.
 * - Не мешает первой загрузке: файл начинает грузиться только после load
 *   и паузы браузера, до этого виден постер.
 * - Играет без звука по кругу, пока виден, и встаёт на паузу вне экрана.
 * - На вертикальных экранах берётся вертикальная версия: карточка шоурила
 *   там вытянута по высоте, горизонтальное видео обрезалось бы до полосы.
 * - prefers-reduced-motion: без автозапуска, со стандартными контролами.
 * - Save-Data (экономия трафика): видео не грузится, виден только постер.
 */
export function ShowreelVideo({
  src,
  srcMobile,
  poster,
  posterMobile,
  label,
}: {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Без анимаций: обычный блок 16:10 под hero, всегда горизонтальная версия.
    // Постер ставим явно: первый рендер (до чтения медиазапроса) мог подменить его
    if (reduced) {
      video.poster = poster;
      return;
    }

    let observer: IntersectionObserver | undefined;
    let idle = 0;
    // Safari до сих пор без requestIdleCallback
    const hasIdle = typeof window.requestIdleCallback === "function";

    const portrait = matchMedia("(orientation: portrait)").matches;
    video.poster = portrait ? posterMobile : poster;
    // Включена экономия трафика: ~2 МБ видео не грузим, остаётся постер
    if (saveData()) return;

    const start = () => {
      video.src = portrait ? srcMobile : src;
      observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
      observer.observe(video);
    };

    const schedule = () => {
      idle = hasIdle
        ? requestIdleCallback(start, { timeout: 2500 })
        : window.setTimeout(start, 1200);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (hasIdle) cancelIdleCallback(idle);
      else clearTimeout(idle);
      observer?.disconnect();
      video.pause();
    };
  }, [src, srcMobile, poster, posterMobile, reduced]);

  return (
    <video
      ref={ref}
      aria-label={label}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
      src={reduced ? src : undefined}
      // Для кнопки play: если ленивая загрузка ещё не подставила src
      data-src={src}
      className="size-full object-cover"
    />
  );
}
