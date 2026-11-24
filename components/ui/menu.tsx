"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type MenuItem = {
  href: "/" | "/work" | "/about" | "/contact";
  label: string;
  /** Картинка, которая проявляется за пунктами при наведении */
  image: string;
};

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Полноэкранное меню из Dock.
 * - Диалог Base UI: ловушка фокуса, Esc, блокировка прокрутки, aria.
 * - Открывается кругом от низа экрана, пункты поднимаются по очереди.
 * - Наведение на пункт мышью проявляет за меню его картинку.
 * - prefers-reduced-motion: без анимаций, просто появляется.
 */
export function Menu({
  items,
  socials,
  labels,
}: {
  items: MenuItem[];
  socials: { name: string; url: string }[];
  labels: { open: string; close: string; title: string; newTab: string };
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          meta,
          "flex h-10 items-center gap-2 rounded-full bg-foreground ps-4 pe-3 text-background transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105",
        )}
      >
        {labels.open}
        <span aria-hidden className="flex flex-col gap-1">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          data-lenis-prevent
          className="group/menu fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background text-foreground transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] [clip-path:circle(150%_at_50%_100%)] data-ending-style:[clip-path:circle(0%_at_50%_100%)] data-starting-style:[clip-path:circle(0%_at_50%_100%)] motion-reduce:transition-none"
        >
          {/* Картинки пунктов: проявляются за списком при наведении */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {items.map((item) => (
              <div
                key={item.href}
                data-active={hovered === item.href || undefined}
                className="absolute inset-0 scale-105 opacity-0 transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] data-active:scale-100 data-active:opacity-25"
              >
                <Image src={item.image} alt="" fill sizes="100vw" className="object-cover object-top" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          </div>

          <div className="flex items-center justify-between px-4 pt-5 min-[400px]:px-5 sm:px-6 md:px-10 md:pt-8">
            <Dialog.Title className={cn(meta, "text-muted-foreground")}>
              {labels.title}
            </Dialog.Title>
            <Dialog.Close
              aria-label={labels.close}
              className="grid size-12 place-items-center rounded-full border border-foreground/30 transition-[rotate,background-color,color] duration-500 hover:rotate-90 hover:bg-foreground hover:text-background"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <nav className="flex flex-1 flex-col justify-center px-4 py-10 min-[400px]:px-5 sm:px-6 md:px-10">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li
                  key={item.href}
                  className="overflow-hidden border-b border-foreground/10 first:border-t"
                  style={{ "--d": `${120 + index * 70}ms` } as CSSProperties}
                >
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(item.href)}
                    onPointerLeave={() => setHovered(null)}
                    className="group/item flex items-baseline gap-4 py-3 transition-[translate] delay-(--d) duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-ending-style/menu:translate-y-full group-data-ending-style/menu:delay-0 group-data-starting-style/menu:translate-y-full motion-reduce:transition-none sm:gap-8 md:py-4"
                  >
                    <span dir="ltr" className={cn(meta, "w-8 text-muted-foreground tabular-nums")}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[clamp(3rem,10vw,8rem)] leading-[0.95] font-light tracking-[-0.05em] transition-[translate,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:translate-x-4 group-hover/item:text-brand group-aria-[current=page]/item:text-brand rtl:group-hover/item:-translate-x-4">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-8 min-[400px]:px-5 sm:px-6 md:px-10 md:pb-10">
            {socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(meta, "inline-flex items-center gap-1.5 hover:text-brand")}
              >
                {social.name}
                <span className="sr-only"> ({labels.newTab})</span>
                <ArrowUpRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
              </a>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
