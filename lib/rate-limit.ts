import "server-only";

/**
 * Простой ограничитель частоты в памяти процесса (скользящее окно).
 * На Vercel у каждого экземпляра функции своя память, так что это защита
 * «от дурака» и от простого спама, а не строгая гарантия. Для строгой
 * понадобится общее хранилище (Upstash Redis, Supabase).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  // Не даём карте расти бесконечно
  if (hits.size > 5000) {
    for (const [entry, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(entry);
    }
  }
  return true;
}
