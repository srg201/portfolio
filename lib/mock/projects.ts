/**
 * Моковые данные проектов до подключения Supabase (этап 5).
 * Источник: публичные репозитории github.com/srg201 и их README.
 * Тексты пока только на английском; переводы появятся в project_translations.
 *
 * Медиа записывает `pnpm showcases` (scripts/record-showcases.ts) в
 * public/showcases/{slug}/: desktop.mp4, mobile.mp4, poster.jpg.
 */

export const projectCategories = ["app", "website", "landing"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

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
  /** Тип для фильтра на странице работ */
  category: ProjectCategory;
  /** false: проект скрыт с сайта (см. комментарий у записи) */
  isPublished: boolean;
  isFeatured: boolean;
  /** Обложка крутится в карусели проектов (hero) */
  inCarousel: boolean;
  /** Что сделано: пункты из README репозитория, для страницы кейса */
  highlights: string[];
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
    category: "app",
    isPublished: true,
    isFeatured: true,
    inCarousel: true,
    highlights: [
      "Collaborative doc and infinite canvas synced live between everyone in the workspace, with presence and cursors.",
      "Workspace agent on Gemini with tool calling that edits the doc and the canvas directly in the browser.",
      "Review mode: every agent change is recorded with an exact inverse and can be accepted, rejected or undone later.",
      "Teams, plans and limits on Clerk organizations and Clerk Billing.",
      "Public read-only sharing links, PDF export and a kanban board of workspaces.",
      "English and Russian throughout, command palette, light and dark themes.",
    ],
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
    category: "app",
    isPublished: true,
    isFeatured: true,
    inCarousel: true,
    highlights: [
      "Booking in three steps: doctor, day, 30-minute slot, only within the doctor's working days.",
      "No double booking even under races: a unique slot key in the database, the second request gets a 409.",
      "Staff dashboard with a two-week load chart, status filters and full-text search.",
      "Server-side authorization everywhere; ID documents live in a private bucket and are served only to the owner or staff.",
      "Time zones done properly: slots on the clinic's wall clock, stored in UTC, unit-tested around DST.",
      "One-click demo accounts for patients and staff, reset twice a week by a scheduled workflow.",
    ],
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
    category: "app",
    isPublished: true,
    isFeatured: true,
    inCarousel: true,
    highlights: [
      "Developers publish tutorials with cover images; readers discuss them in the comments.",
      "Live presence on every post: you see who is reading right now.",
      "Full-text search across titles and post bodies.",
      "Cached pages on Next.js 16 Cache Components; new posts and comments appear immediately.",
      "Accounts with email verification and mandatory two-factor sign-in, rate limits and hashed one-time codes.",
    ],
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
    category: "website",
    isPublished: true,
    isFeatured: true,
    inCarousel: true,
    // На живом сайте нет <meta name="viewport">: телефон показывает десктоп в 980px,
    // мобильную запись не делаем, пока это не исправят
    highlights: [
      "Responsive, fast, SEO-friendly pages for services, projects, R&D, about and contact.",
      "Headless CMS on Strapi and PostgreSQL: the client edits every page without touching code.",
      "Contact form with email delivery through Resend.",
      "Markdown rendering for long-form project and R&D content.",
      "Deployment with Docker Compose on a VPS behind Nginx, with SSL and the custom domain.",
    ],
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
    category: "landing",
    isPublished: true,
    isFeatured: true,
    inCarousel: true,
    highlights: [
      "Matches the Figma design pixel for pixel.",
      "Right-to-left layout and Hebrew typography.",
      "Responsive from 320px up.",
      "Plain HTML, CSS and JavaScript with no frameworks: loads fast and is easy for the client to embed.",
      "Lead-capture form.",
    ],
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
    category: "website",
    isPublished: false,
    isFeatured: false,
    inCarousel: false,
    highlights: [],
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
    category: "landing",
    isPublished: false,
    isFeatured: false,
    inCarousel: false,
    highlights: [],
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
    category: "landing",
    isPublished: true,
    isFeatured: false,
    inCarousel: true,
    highlights: [
      "Hero, stats, features, billing, testimonials and call-to-action sections.",
      "Fully responsive with a mobile navigation drawer.",
      "Reusable, data-driven components with content kept in one constants file.",
      "Custom Tailwind theme: colours, fonts and breakpoints.",
    ],
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
    category: "landing",
    isPublished: true,
    isFeatured: false,
    inCarousel: true,
    highlights: [
      "Figma-to-code implementation with gradient text, a glassy call to action and a brand strip.",
      "BEM-style Sass modules for each section.",
      "Mobile-first responsive layout with a hamburger menu.",
    ],
    showcase: { scrollDepth: 0.85, scrollSeconds: 9 },
  },
];

/** Проекты, которые показываются на сайте, в порядке списка */
export const publishedProjects = projects.filter(
  (project) => project.isPublished,
);

export function getProject(slug: string) {
  return publishedProjects.find((project) => project.slug === slug);
}

/** Следующий проект для перехода внизу кейса (по кругу) */
export function getNextProject(slug: string) {
  const index = publishedProjects.findIndex((project) => project.slug === slug);
  return publishedProjects[(index + 1) % publishedProjects.length]!;
}
