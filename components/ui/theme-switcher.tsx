"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

const themes = ["light", "dark", "system"] as const;
type ThemeValue = (typeof themes)[number];

const subscribe = () => () => {};

/** true только на клиенте после гидрации: тема до этого неизвестна */
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/** Запускает view transition, в котором новая тема раскрывается кругом из (x, y) */
function revealTheme(update: () => void, x: number, y: number, radius: number) {
  const root = document.documentElement;
  root.dataset.themeTransition = "";

  const transition = document.startViewTransition(update);

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});

  transition.finished.finally(() => {
    delete root.dataset.themeTransition;
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeSwitcher() {
  const t = useTranslations("ThemeSwitcher");
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const activeIndex = mounted
    ? Math.max(0, themes.indexOf((theme ?? "system") as ThemeValue))
    : -1;

  function select(value: ThemeValue, button: HTMLElement) {
    if (value === theme) return;

    const nextResolved = value === "system" ? systemTheme : value;
    const colorsChange = nextResolved !== resolvedTheme;

    if (
      !colorsChange ||
      !document.startViewTransition ||
      prefersReducedMotion()
    ) {
      setTheme(value);
      return;
    }

    // Новая тема разливается кругом из центра нажатой кнопки
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    revealTheme(() => flushSync(() => setTheme(value)), x, y, radius);
  }

  /**
   * Клавиатура как у radiogroup: один Tab-стоп, стрелки двигают выбор
   * (в RTL влево и вправо зеркально), Home/End к краям.
   */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const current = Math.max(activeIndex, 0);
    const step: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: 1,
      ArrowUp: -1,
    };
    let next: number;
    if (event.key in step) {
      next = (current + step[event.key]! + themes.length) % themes.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = themes.length - 1;
    else return;

    event.preventDefault();
    const button = event.currentTarget.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    )[next];
    if (!button) return;
    button.focus();
    select(themes[next]!, button);
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      onKeyDown={onKeyDown}
      className="relative inline-grid grid-cols-3 rounded-full border bg-background/60 p-1 backdrop-blur"
    >
      {/* Плашка активного варианта; логическое смещение работает и в RTL */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 start-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-foreground transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] [--dir:1] rtl:[--dir:-1]"
        style={{
          translate: `calc(${Math.max(activeIndex, 0) * 100}% * var(--dir)) 0`,
          opacity: activeIndex < 0 ? 0 : 1,
        }}
      />
      {themes.map((value, index) => {
        const checked = index === activeIndex;
        // До гидрации выбор неизвестен: Tab-стоп на первой кнопке
        const tabbable = activeIndex < 0 ? index === 0 : checked;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={tabbable ? 0 : -1}
            aria-label={t(value)}
            title={t(value)}
            onClick={(event) => select(value, event.currentTarget)}
            className="group relative z-10 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors duration-300 hover:text-foreground aria-checked:text-background"
          >
            <ThemeIcon value={value} />
          </button>
        );
      })}
    </div>
  );
}

function ThemeIcon({ value }: { value: ThemeValue }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className:
      "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-aria-checked:rotate-[360deg]",
  };

  if (value === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (value === "dark") {
    return (
      <svg {...common}>
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
