/**
 * Публичные переменные окружения. Next.js встраивает NEXT_PUBLIC_* при сборке
 * только при прямом обращении `process.env.NAME`, поэтому перечисляем их явно.
 * Серверные секреты (DATABASE_URL и т. д.) читаются только в server-only модулях.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Переменная окружения ${name} не задана. Скопируйте .env.example в .env.local и заполните её.`,
    );
  }
  return value;
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
};
