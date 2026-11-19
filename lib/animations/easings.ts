/**
 * Общие кривые и длительности анимаций сайта.
 * CSS-варианты дублируются в globals.css (--ease-*), GSAP-варианты: строки ниже.
 */
export const ease = {
  /** Плавный выход: появления, раскрытия */
  out: "expo.out",
  /** Мягкий вход-выход: перемещения, морфинг */
  inOut: "power3.inOut",
  /** Пружинка для мелких элементов */
  spring: "back.out(1.6)",
} as const;

export const duration = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
} as const;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
