import { cacheLife } from "next/cache";

/**
 * Карьера в цифрах. Дата начала и число проектов задаются здесь,
 * позже переедут в site_settings (админка).
 */
export const career = {
  /** Когда начал писать код (месяц и день условные) */
  start: "2020-01-01",
  /** Запущенных проектов, показывается как «20+» */
  projects: 20,
} as const;

const DAY_MS = 86_400_000;

/**
 * Дни и годы с начала карьеры. Текущая дата читается в "use cache":
 * число попадает в статический HTML и пересчитывается раз в сутки.
 */
export async function getCareerStats() {
  "use cache";
  cacheLife("days");

  const start = new Date(`${career.start}T00:00:00Z`);
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / DAY_MS);

  const anniversary = new Date(start);
  anniversary.setUTCFullYear(now.getUTCFullYear());
  const years =
    now.getUTCFullYear() - start.getUTCFullYear() - (now < anniversary ? 1 : 0);

  return {
    days,
    years,
    startYear: start.getUTCFullYear(),
    projects: career.projects,
  };
}
