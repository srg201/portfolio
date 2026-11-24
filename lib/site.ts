import { cacheLife } from "next/cache";

/** Текущий год для копирайта: статический HTML, пересчёт раз в сутки */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}
