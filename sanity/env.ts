/**
 * Подключение к Sanity. Без NEXT_PUBLIC_SANITY_PROJECT_ID сайт работает
 * на локальных данных (lib/mock), а /admin показывает подсказку.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
/** Дата фиксирует версию API Sanity: поведение не изменится без нашего ведома */
export const apiVersion = "2026-11-01";

export const sanityConfigured = /^[a-z0-9-]+$/.test(projectId);
