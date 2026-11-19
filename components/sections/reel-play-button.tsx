"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type FullscreenVideo = HTMLVideoElement & {
  /** iOS Safari: полноэкранный режим есть только у видео */
  webkitEnterFullscreen?: () => void;
};

/**
 * Кнопка play у шоурила: открывает видео hero на весь экран со стандартными
 * контролами, после выхода контролы снова прячутся.
 */
export function ReelPlayButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  function play() {
    const video = document.querySelector<FullscreenVideo>(
      "[data-reel-layer] video",
    );
    if (!video) return;
    if (!video.src && video.dataset.src) video.src = video.dataset.src;
    video.controls = true;
    video.play().catch(() => {});

    const restore = () => {
      if (document.fullscreenElement) return;
      video.controls = false;
      document.removeEventListener("fullscreenchange", restore);
    };

    if (video.requestFullscreen) {
      document.addEventListener("fullscreenchange", restore);
      video.requestFullscreen().catch(() => restore());
    } else {
      video.webkitEnterFullscreen?.();
    }
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={label}
      className={cn(
        "pointer-events-auto grid h-10 w-16 place-items-center rounded-full bg-foreground text-background shadow-lg transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110",
        className,
      )}
    >
      <Play aria-hidden className="size-4 fill-current" />
    </button>
  );
}
