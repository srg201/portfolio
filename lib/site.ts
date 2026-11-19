import { cacheLife } from "next/cache";

/**
 * Контакты и ссылки владельца. Позже переедут в site_settings (админка).
 * Почта не заполнена: адрес публикуется только после подтверждения владельца.
 * Пустые значения на сайте просто не показываются.
 */
export const site = {
  email: null as string | null,
  socials: [{ name: "GitHub", url: "https://github.com/srg201" }],
};

/** Текущий год для копирайта: статический HTML, пересчёт раз в сутки */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}
