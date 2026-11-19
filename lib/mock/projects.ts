/**
 * Моковые данные проектов до подключения Supabase (этап 5).
 * Источник: публичные репозитории github.com/srg201 и их README.
 * Тексты пока только на английском; переводы появятся в project_translations.
 *
 * Медиа записывает `pnpm showcases` (scripts/record-showcases.ts) в
 * public/showcases/{slug}/: desktop.mp4, mobile.mp4, poster.jpg.
 */

export type MockProject = {
  slug: string;
  title: string;
  /** Одна строка для карточки */
  summary: string;
  year: number;
  client: string | null;
  role: string;
  stack: string[];
  liveUrl: string;
  repoUrl: string;
  isFeatured: boolean;
  /** Обложка крутится в кольце проектов после шоурила (hero) */
  inCarousel: boolean;
  /** Сценарий записи шоукейса */
  showcase: {
    /** Доля высоты страницы, которую проматываем (0..1) */
    scrollDepth: number;
    /** Длительность прокрутки, с */
    scrollSeconds: number;
    /** false: мобильную версию не записываем (сайт не адаптирован под телефон) */
    mobile?: boolean;
  };
};

export const projects: MockProject[] = [
  {
    slug: "outpost",
    title: "Outpost",
    summary:
      "Real-time workspace: a collaborative doc, an infinite canvas and an AI agent whose edits you review and accept.",
    year: 2026,
    client: null,
    role: "Full-stack: product, design, development",
    stack: ["Next.js 16", "Supabase", "Yjs", "tldraw", "Clerk", "Gemini"],
    liveUrl: "https://outpost-gray.vercel.app",
    repoUrl: "https://github.com/srg201/outpost",
    isFeatured: true,
    inCarousel: true,
    showcase: { scrollDepth: 0.7, scrollSeconds: 10 },
  },
  {
    slug: "halden",
    title: "Halden",
    summary:
      "Clinic appointment booking: patient portal with a slot timetable, staff dashboard and role-based access.",
    year: 2025,
    client: null,
    role: "Full-stack development",
    stack: ["Next.js 16", "React 19", "Appwrite", "shadcn/ui", "Zod"],
    liveUrl: "https://healthcare-platform-fawn.vercel.app",
    repoUrl: "https://github.com/srg201/healthcare-platform",
    isFeatured: true,
    inCarousel: true,
    showcase: { scrollDepth: 0.8, scrollSeconds: 10 },
  },
  {
    slug: "nextpro",
    title: "NextPro",
    summary:
      "Tutorial platform with live readers, comments and full-text search on Next.js 16 Cache Components.",
    year: 2026,
    client: null,
    role: "Full-stack development",
    stack: ["Next.js 16", "Convex", "Better Auth", "TypeScript"],
    liveUrl: "https://nextpro-rho.vercel.app",
    repoUrl: "https://github.com/srg201/nextpro",
    isFeatured: true,
    inCarousel: true,
    showcase: { scrollDepth: 0.8, scrollSeconds: 9 },
  },
  {
    slug: "xplane-labs",
    title: "XPlane Labs",
    summary:
      "Production website for a New Zealand aerospace engineering firm, fully editable through a headless CMS.",
    year: 2025,
    client: "XPlane Labs",
    role: "Design, frontend, CMS, deployment",
    stack: ["Next.js", "Strapi", "PostgreSQL", "Docker", "Nginx"],
    liveUrl: "https://xplanelabs.nz",
    repoUrl: "https://github.com/srg201/x-plane",
    isFeatured: true,
    inCarousel: true,
    // На живом сайте нет <meta name="viewport">: телефон показывает десктоп в 980px,
    // мобильную запись не делаем, пока это не исправят
    showcase: { scrollDepth: 0.8, scrollSeconds: 11, mobile: false },
  },
  {
    slug: "fatfish",
    title: "FatFish",
    summary:
      "Pixel-perfect RTL campaign landing page in Hebrew for an Israeli web agency, from Figma to code.",
    year: 2025,
    client: "FatFish",
    role: "Frontend development",
    stack: ["HTML", "SCSS", "JavaScript"],
    liveUrl: "https://www.fatfish.co.il/campaign/2025audit",
    repoUrl: "https://github.com/srg201/fatfish",
    isFeatured: true,
    inCarousel: true,
    showcase: { scrollDepth: 0.85, scrollSeconds: 11 },
  },
  {
    slug: "birrlink",
    title: "BirrLink",
    summary:
      "Marketing site for a money transfer service from Canada to Ethiopia.",
    year: 2024,
    client: "BirrLink",
    role: "Frontend development",
    stack: ["Next.js", "Tailwind CSS", "shadcn/ui", "Docker"],
    liveUrl: "https://birrlink.vercel.app",
    repoUrl: "https://github.com/srg201/birrlink",
    // В блоке «Explainer Video» на живом сайте стоит чужое YouTube-демо:
    // не показываем, пока его не заменят роликом клиента
    isFeatured: false,
    inCarousel: false,
    showcase: { scrollDepth: 0.85, scrollSeconds: 10 },
  },
  {
    slug: "apex",
    title: "Apex Nerd Labs",
    summary:
      "Landing page for an AI service: custom design, motion, dark mode and a working contact form.",
    year: 2025,
    client: "Apex Nerd Labs",
    role: "Design and development",
    stack: ["Next.js", "Framer Motion", "React Email", "shadcn/ui"],
    liveUrl: "https://apex-landing.vercel.app",
    repoUrl: "https://github.com/srg201/apex-landing",
    // На живом сайте в блоке услуг остались заглушки «Card Title»: не показываем,
    // пока их не заменят реальным контентом
    isFeatured: false,
    inCarousel: false,
    showcase: { scrollDepth: 0.85, scrollSeconds: 10 },
  },
  {
    slug: "hoobank",
    title: "HooBank",
    summary: "Fintech landing page with a dark theme and 3D visuals.",
    year: 2022,
    client: null,
    role: "Frontend development",
    stack: ["React", "Vite", "Tailwind CSS"],
    liveUrl: "https://hoo-bank-rouge-five.vercel.app",
    repoUrl: "https://github.com/srg201/HooBank",
    isFeatured: false,
    inCarousel: true,
    showcase: { scrollDepth: 0.85, scrollSeconds: 9 },
  },
  {
    slug: "gpt3",
    title: "GPT-3 Landing",
    summary: "Responsive AI product landing page built from a Figma design.",
    year: 2022,
    client: null,
    role: "Frontend development",
    stack: ["React", "Sass"],
    liveUrl: "https://gpt3-landing-peach.vercel.app",
    repoUrl: "https://github.com/srg201/gpt3-landing",
    isFeatured: false,
    inCarousel: true,
    showcase: { scrollDepth: 0.85, scrollSeconds: 9 },
  },
];
