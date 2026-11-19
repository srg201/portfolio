"use client";

import { Pause, Play } from "lucide-react";
import { Fragment, useState } from "react";
import { Marquee } from "@/components/motion/marquee";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Две встречные бегущие строки и кнопка паузы для обеих.
 * Верхняя крупная, через одно слово контуром; нижняя тише.
 */
export function TechStackMarquee({
  rows,
  pauseLabel,
  playLabel,
}: {
  rows: [string[], string[]];
  pauseLabel: string;
  playLabel: string;
}) {
  const [paused, setPaused] = useState(false);
  const [top, bottom] = rows;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Marquee paused={paused} duration={45}>
        {top.map((name, index) => (
          <Fragment key={name}>
            <span
              className={cn(
                "px-[0.25em] text-[clamp(3rem,9vw,8rem)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap",
                index % 2 === 1 &&
                  "text-transparent [-webkit-text-stroke:1.5px_var(--color-foreground)]",
              )}
            >
              {name}
            </span>
            <span className="text-[clamp(1.5rem,3vw,2.5rem)] text-brand">✦</span>
          </Fragment>
        ))}
      </Marquee>

      <Marquee paused={paused} reverse duration={55}>
        {bottom.map((name) => (
          <Fragment key={name}>
            <span className="px-[0.4em] text-[clamp(1.75rem,4.5vw,4rem)] leading-none font-medium tracking-[-0.03em] whitespace-nowrap text-muted-foreground">
              {name}
            </span>
            <span className="size-2 rounded-full bg-border" />
          </Fragment>
        ))}
      </Marquee>

      <div className="flex justify-end px-4 min-[400px]:px-5 sm:px-6 md:px-10 motion-reduce:hidden">
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className={cn(
            meta,
            "flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {paused ? (
            <Play aria-hidden className="size-3.5" />
          ) : (
            <Pause aria-hidden className="size-3.5" />
          )}
          {paused ? playLabel : pauseLabel}
        </button>
      </div>
    </div>
  );
}
