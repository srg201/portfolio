"use client";

import { useLocale, useTranslations, type Locale } from "next-intl";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { startLocaleLeave } from "@/components/motion/locale-stage";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Название языка на нём самом: «Deutsch», «日本語» */
function nativeName(locale: Locale) {
  const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
  return name ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1) : locale;
}

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Закрытие по клику снаружи
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // При открытии фокус на текущем языке
  useEffect(() => {
    if (!open) return;
    const index = routing.locales.indexOf(locale);
    itemRefs.current[index]?.focus({ preventScroll: true });
  }, [open, locale]);

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }

  function choose(nextLocale: Locale) {
    close({ restoreFocus: true });
    if (nextLocale === locale) return;
    startLocaleLeave();
    startTransition(() => {
      // Тот же путь без префикса локали (/work/my-slug); next-intl обновит cookie NEXT_LOCALE
      router.replace(pathname, { locale: nextLocale, scroll: false });
    });
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const move = (index: number) =>
      items[(index + items.length) % items.length]?.focus();

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close({ restoreFocus: true });
        break;
      case "ArrowDown":
        event.preventDefault();
        move(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(current - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(items.length - 1);
        break;
      case "Tab":
        close({ restoreFocus: false });
        break;
    }
  }

  // Панель открывается вверх: переключатель живёт в нижней плашке (Dock).
  // На мобиле она растягивается по ширине плашки, поэтому root без relative
  return (
    <div ref={rootRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${t("label")}: ${nativeName(locale)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-busy={isPending}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="group inline-flex h-10 items-center gap-1.5 rounded-full border bg-background/60 ps-1.5 pe-2.5 text-sm sm:gap-2 sm:ps-2 sm:pe-3 backdrop-blur transition-colors duration-300 hover:border-foreground/40"
      >
        <span className="relative grid size-7 place-items-center overflow-hidden rounded-full bg-foreground text-[0.65rem] font-semibold tracking-wider text-background uppercase">
          <span
            key={locale}
            className="animate-[locale-code-in_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            {locale}
          </span>
          {isPending && (
            <span
              aria-hidden
              className="absolute inset-0 animate-spin rounded-full border-2 border-background/20 border-t-brand"
            />
          )}
        </span>
        {/* На мобиле только код языка: шапка помещается в одну строку */}
        <span lang={locale} className="hidden sm:inline">
          {nativeName(locale)}
        </span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-aria-expanded:rotate-180"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={t("label")}
        data-open={open || undefined}
        inert={!open}
        onKeyDown={onMenuKeyDown}
        className="group/menu invisible absolute inset-x-0 bottom-full z-50 mb-2 origin-bottom translate-y-1 scale-95 rounded-3xl border bg-popover/90 p-2 text-popover-foreground opacity-0 shadow-2xl shadow-foreground/10 backdrop-blur-xl transition-[opacity,scale,translate,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:end-0 sm:mb-3 sm:w-88 sm:origin-bottom-right sm:rtl:origin-bottom-left data-open:visible data-open:translate-y-0 data-open:scale-100 data-open:opacity-100"
      >
        <ul className="grid grid-cols-2 gap-0.5">
          {routing.locales.map((value, index) => {
            const current = value === locale;
            return (
              <li
                key={value}
                role="none"
                style={{ transitionDelay: open ? `${index * 18}ms` : "0ms" }}
                className="translate-y-1 opacity-0 transition-[opacity,translate] duration-300 ease-out group-data-open/menu:translate-y-0 group-data-open/menu:opacity-100"
              >
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={current}
                  lang={value}
                  tabIndex={-1}
                  onClick={() => choose(value)}
                  className="group/item flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-start text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none aria-checked:text-foreground"
                >
                  <span className="w-6 font-mono text-[0.65rem] tracking-wider uppercase opacity-60">
                    {value}
                  </span>
                  <span className="flex-1 truncate">{nativeName(value)}</span>
                  <span
                    aria-hidden
                    className="size-1.5 scale-0 rounded-full bg-brand transition-transform duration-300 group-aria-checked/item:scale-100"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
