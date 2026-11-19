import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Схема БД и RLS-политики (Drizzle + drizzle-orm/supabase).
 * Таблицы из docs/PLAN.md, раздел 5, добавляются на этапе 5.
 *
 * Все таблицы объявляем через `table` (или `table.withRLS`):
 * поля в TS пишутся camelCase, а в Postgres становятся snake_case.
 */
export const table = pgTableCreator((name) => name, "snake_case");
