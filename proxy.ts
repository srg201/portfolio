import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Админка живёт вне локалей: только обновляем сессию Supabase.
  // Публичный сайт не трогает Auth, чтобы оставаться статическим и быстрым.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { response } = await updateSession(request);
    return response;
  }

  return handleI18nRouting(request);
}

export const config = {
  // Всё, кроме API, служебных путей Next/Vercel и файлов с расширением
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
