/**
 * Услуги до подключения Supabase (таблицы services / service_translations).
 * Тексты в messages/{locale}.json → Services.items.{slug}.
 * example: проект, чья обложка показывается в превью услуги:
 * - slug проекта из lib/mock/projects.ts (public/work/{slug}/cover.jpg);
 * - "portfolio": этот сайт (public/work/portfolio/cover.jpg, снимок hero);
 * - null: подходящего проекта в портфолио пока нет, превью без картинки.
 */
export type ServiceSlug =
  | "frontend"
  | "backend"
  | "fullstack"
  | "motion"
  | "ecommerce";

export type MockService = {
  slug: ServiceSlug;
  stack: string[];
  example: string | null;
};

export const services: MockService[] = [
  {
    slug: "frontend",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    example: "fatfish",
  },
  {
    slug: "backend",
    stack: ["Node.js", "PostgreSQL", "Supabase", "REST / tRPC"],
    example: "halden",
  },
  {
    slug: "fullstack",
    stack: ["Next.js", "Supabase", "Drizzle", "Vercel"],
    example: "outpost",
  },
  {
    slug: "motion",
    stack: ["GSAP", "WebGL", "Three.js", "Motion"],
    example: "portfolio",
  },
  {
    slug: "ecommerce",
    stack: ["Next.js", "Stripe", "Shopify", "Headless CMS"],
    example: null,
  },
];
