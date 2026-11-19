import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Supabase в Server Components, Server Actions и Route Handlers.
 * Создаётся заново на каждый запрос. Читает cookies, поэтому рендер динамический:
 * используем только в админке и в местах, где нужна сессия.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Вызов из Server Component: писать cookies нельзя.
            // Сессию обновляет proxy, так что это безопасно.
          }
        },
      },
    },
  );
}
