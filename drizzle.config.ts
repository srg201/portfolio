import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Миграции идут через прямое подключение или session pooler (5432), не через transaction pooler
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
  entities: {
    // Роли Supabase уже существуют: drizzle-kit не должен их создавать
    roles: { provider: "supabase" },
  },
  schemaFilter: ["public"],
  verbose: true,
});
