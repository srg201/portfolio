"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Видео без звука, которое грузится, только когда подъезжает к экрану,
 * и играет, только пока видно. До загрузки виден постер.
 * prefers-reduced-motion: без автозапуска, со стандартными контролами.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (matchMedia(REDUCED).matches) {
      video.controls = true;
      video.preload = "metadata";
      video.src = src;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      aria-label={label}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={cn("size-full object-cover object-top", className)}
    />
  );
}
