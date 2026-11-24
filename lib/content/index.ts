import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "next-sanity";
import { defaultLocale, type Locale } from "@/i18n/locales";
import { career } from "@/lib/career";
import { projects as mockProjects, type ProjectCategory } from "@/lib/mock/projects";
import { apiVersion, dataset, projectId, sanityConfigured } from "@/sanity/env";

/**
 * Контент сайта: проекты и настройки.
 * - Подключён Sanity (NEXT_PUBLIC_SANITY_PROJECT_ID) и в нём есть проекты: берём оттуда.
 * - Иначе: локальные данные из lib/mock (медиа в public/work/{slug}).
 * Запросы кешируются ("use cache", тег "sanity"); после публикации в Studio
 * вебхук /api/revalidate сбрасывает кеш, и сайт обновляется без пересборки.
 */

export const CONTENT_TAG = "sanity";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  highlights: string[];
  /** Язык текстов проекта: язык страницы или английский, если перевода нет */
  lang: Locale;
  year: number;
  client: string | null;
  stack: string[];
  category: ProjectCategory;
  liveUrl: string | null;
  repoUrl: string | null;
  isFeatured: boolean;
  inCarousel: boolean;
  cover: { src: string; blurDataURL?: string };
  preview: string | null;
  caseVideo: string | null;
  caseMobileVideo: string | null;
};

export type Settings = {
  available: boolean;
  email: string | null;
  socials: { name: string; url: string }[];
  careerStart: string;
  projectsCount: number;
};

const defaultSettings: Settings = {
  available: true,
  email: null,
  socials: [{ name: "GitHub", url: "https://github.com/srg201" }],
  careerStart: career.start,
  projectsCount: career.projects,
};

const client = sanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;

/* ---------- Сырые данные из Sanity ---------- */

type Localized = Partial<Record<Locale, string>>;

type RawProject = {
  slug: string;
  title: string;
  summary: Localized;
  role: Localized;
  highlights: Localized[] | null;
  year: number;
  client: string | null;
  stack: string[] | null;
  category: ProjectCategory;
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean | null;
  inCarousel: boolean | null;
  cover: { url: string; lqip: string | null } | null;
  preview: string | null;
  caseVideo: string | null;
  caseMobileVideo: string | null;
};

const PROJECTS_QUERY = `*[_type == "project" && published != false && defined(slug.current)]
  | order(coalesce(order, 100) asc, year desc) {
    "slug": slug.current, title, summary, role, highlights, year, client, stack,
    category, liveUrl, repoUrl, featured, inCarousel,
    "cover": cover.asset->{ url, "lqip": metadata.lqip },
    "preview": preview.asset->url,
    "caseVideo": caseVideo.asset->url,
    "caseMobileVideo": caseMobileVideo.asset->url
  }`;

const SETTINGS_QUERY = `*[_id == "settings"][0]{ available, email, socials[]{ name, url }, careerStart, projectsCount }`;

/**
 * Запрос к Sanity с кешем. Если Sanity недоступен, возвращаем null
 * (сайт покажет локальные данные) и кешируем это ненадолго.
 */
async function fetchSanity<T>(query: string): Promise<T | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  if (!client) {
    cacheLife("max");
    return null;
  }
  try {
    const result = await client.fetch<T>(query);
    cacheLife("max");
    return result;
  } catch (error) {
    console.error("Sanity fetch failed:", error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return null;
  }
}

/* ---------- Проекты ---------- */

const pick = (value: Localized | null | undefined, locale: Locale) =>
  value?.[locale]?.trim() || value?.[defaultLocale]?.trim() || "";

function fromSanity(raw: RawProject, locale: Locale): Project | null {
  if (!raw.cover?.url) return null;
  return {
    slug: raw.slug,
    title: raw.title,
    summary: pick(raw.summary, locale),
    role: pick(raw.role, locale),
    highlights: (raw.highlights ?? []).map((item) => pick(item, locale)).filter(Boolean),
    lang: raw.summary?.[locale]?.trim() ? locale : defaultLocale,
    year: raw.year,
    client: raw.client?.trim() || null,
    stack: raw.stack ?? [],
    category: raw.category,
    liveUrl: raw.liveUrl ?? null,
    repoUrl: raw.repoUrl ?? null,
    isFeatured: raw.featured === true,
    inCarousel: raw.inCarousel !== false,
    cover: { src: raw.cover.url, blurDataURL: raw.cover.lqip ?? undefined },
    preview: raw.preview,
    caseVideo: raw.caseVideo,
    caseMobileVideo: raw.caseMobileVideo,
  };
}

function fromMock(locale: Locale): Project[] {
  void locale;
  return mockProjects
    .filter((project) => project.isPublished)
    .map((project) => {
      const base = `/work/${project.slug}`;
      return {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        role: project.role,
        highlights: project.highlights,
        lang: defaultLocale,
        year: project.year,
        client: project.client,
        stack: project.stack,
        category: project.category,
        liveUrl: project.liveUrl,
        repoUrl: project.repoUrl,
        isFeatured: project.isFeatured,
        inCarousel: project.inCarousel,
        cover: { src: `${base}/cover.jpg` },
        preview: `${base}/preview.mp4`,
        caseVideo: `${base}/case.mp4`,
        caseMobileVideo: project.showcase.mobile === false ? null : `${base}/case-mobile.mp4`,
      };
    });
}

/** Опубликованные проекты в порядке показа, тексты на языке страницы */
export async function getProjects(locale: Locale): Promise<Project[]> {
  const raw = await fetchSanity<RawProject[]>(PROJECTS_QUERY);
  const list = (raw ?? [])
    .map((project) => fromSanity(project, locale))
    .filter((project): project is Project => project !== null);
  return list.length > 0 ? list : fromMock(locale);
}

export async function getProject(slug: string, locale: Locale) {
  return (await getProjects(locale)).find((project) => project.slug === slug) ?? null;
}

/** Следующий проект по кругу: для перехода внизу кейса */
export async function getNextProject(slug: string, locale: Locale) {
  const list = await getProjects(locale);
  const index = list.findIndex((project) => project.slug === slug);
  return list[(index + 1) % list.length]!;
}

/* ---------- Настройки ---------- */

type RawSettings = Partial<{
  available: boolean | null;
  email: string | null;
  socials: { name: string; url: string }[] | null;
  careerStart: string | null;
  projectsCount: number | null;
}>;

export async function getSettings(): Promise<Settings> {
  const raw = await fetchSanity<RawSettings | null>(SETTINGS_QUERY);
  if (!raw) return defaultSettings;
  return {
    available: raw.available ?? defaultSettings.available,
    email: raw.email?.trim() || null,
    socials: raw.socials?.filter((social) => social?.name && social?.url) ?? defaultSettings.socials,
    careerStart: raw.careerStart ?? defaultSettings.careerStart,
    projectsCount: raw.projectsCount ?? defaultSettings.projectsCount,
  };
}

