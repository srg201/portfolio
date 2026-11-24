import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Шапка внутренней страницы: метка в скобках, крупный заголовок (h1)
 * и вводный абзац. Справа можно положить дополнительный блок (aside).
 */
export function PageIntro({
  label,
  title,
  intro,
  aside,
}: {
  label: string;
  title: string;
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
      <div className="flex flex-col gap-5">
        <p data-reveal-item aria-hidden className={cn(meta, "text-brand")}>
          ( {label} )
        </p>
        <h1
          data-reveal-item
          className="text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] font-light tracking-[-0.05em] text-balance"
        >
          {title}
        </h1>
      </div>
      {(intro || aside) && (
        <div data-reveal-item className="flex max-w-md flex-col gap-6 md:items-end md:text-end">
          {intro && (
            <p className="text-base text-pretty text-muted-foreground sm:text-lg">
              {intro}
            </p>
          )}
          {aside}
        </div>
      )}
    </Reveal>
  );
}
