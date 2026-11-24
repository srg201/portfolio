import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Языки: редирект на /{locale} по cookie и Accept-Language.
 * Админка (/admin, Sanity Studio) и API живут вне локалей и сюда не попадают.
 */
export default createMiddleware(routing);

export const config = {
  // Всё, кроме API, админки, служебных путей Next/Vercel и файлов с расширением
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
