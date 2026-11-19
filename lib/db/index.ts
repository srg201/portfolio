import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Переменная окружения DATABASE_URL не задана. Скопируйте .env.example в .env.local и заполните её.",
  );
}

// В dev переиспользуем подключение между HMR-перезагрузками, иначе пул быстро кончится
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

// Transaction pooler Supabase (порт 6543) не поддерживает prepared statements
const client =
  globalForDb.pgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

/**
 * Drizzle работает на сервере от роли postgres и обходит RLS.
 * Публичные запросы обязаны сами фильтровать `is_published = true`.
 */
export const db = drizzle({ client });
