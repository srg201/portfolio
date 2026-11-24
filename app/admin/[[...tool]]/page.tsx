/**
 * Sanity Studio на /admin. Без NEXT_PUBLIC_SANITY_PROJECT_ID показывает,
 * что нужно настроить (см. .env.example).
 */
import { sanityConfigured } from "@/sanity/env";
import { Studio } from "./studio";

export { metadata, viewport } from "next-sanity/studio";

export default function AdminPage() {
  if (!sanityConfigured) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24, lineHeight: 1.6 }}>
        <h1 style={{ fontWeight: 400 }}>Админка не подключена</h1>
        <p>
          Задайте <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> и <code>NEXT_PUBLIC_SANITY_DATASET</code> в{" "}
          <code>.env.local</code> (и в настройках Vercel), затем перезапустите сервер.
        </p>
      </main>
    );
  }
  return <Studio />;
}
