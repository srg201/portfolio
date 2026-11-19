import { notFound } from "next/navigation";

// Страница всегда отдаёт 404, проверять мгновенную навигацию и статическую оболочку нечего
export const instant = false;

// Неизвестные пути внутри локали показывают локализованную 404 из [locale]/not-found.tsx
export default function CatchAllPage() {
  notFound();
}
