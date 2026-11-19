import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Supabase в браузере: Auth, Storage, Realtime. */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
