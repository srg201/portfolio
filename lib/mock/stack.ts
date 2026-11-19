/**
 * Технологии до подключения Supabase (таблица technologies).
 * Только то, что реально есть в проектах портфолио (lib/mock/projects.ts)
 * и в этом сайте. Названия категорий: messages → Stack.categories.
 */
export type StackCategory = "frontend" | "backend" | "motion" | "infra";

export const stack: Record<StackCategory, string[]> = {
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  backend: [
    "Node.js",
    "PostgreSQL",
    "Supabase",
    "Drizzle",
    "Convex",
    "Appwrite",
    "Strapi",
  ],
  motion: ["GSAP", "Motion", "Three.js", "WebGL", "Lenis"],
  infra: ["Vercel", "Docker", "Nginx", "Git", "Figma"],
};

/** Верхняя бегущая строка: главное; нижняя: всё остальное */
export const marqueeRows: [string[], string[]] = [
  ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "GSAP", "Tailwind CSS"],
  ["Node.js", "Three.js", "WebGL", "Drizzle", "Convex", "Motion", "Docker", "Vercel", "Strapi", "Figma"],
];
