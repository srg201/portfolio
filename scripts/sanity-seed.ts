/**
 * Перенос текущих проектов (lib/mock/projects.ts) и настроек в Sanity:
 *   pnpm sanity:seed
 *
 * Загружает обложки и видео из public/work/{slug}, создаёт документы
 * project-{slug} и «Настройки сайта». Повторный запуск обновляет проекты
 * (тексты и медиа), а настройки не трогает, если они уже есть.
 * Переводы, сделанные в Studio, при повторном запуске сохраняются:
 * перезаписывается только английский текст.
 *
 * Нужны NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 * и SANITY_API_WRITE_TOKEN (права Editor) в .env.local.
 */
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { career } from "../lib/career";
import { projects } from "../lib/mock/projects";
import { apiVersion, dataset, projectId, sanityConfigured } from "../sanity/env";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!sanityConfigured || !token) {
  console.error("✕ Задайте NEXT_PUBLIC_SANITY_PROJECT_ID и SANITY_API_WRITE_TOKEN в .env.local");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const publicDir = path.join(process.cwd(), "public");

/** Загружает файл (одинаковые файлы Sanity не дублирует) и возвращает ссылку на ассет */
async function upload(kind: "image" | "file", relative: string) {
  const file = path.join(publicDir, relative);
  if (!existsSync(file)) return undefined;
  const asset = await client.assets.upload(kind, createReadStream(file), {
    filename: path.basename(relative),
  });
  return { _type: kind, asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  console.log(`Sanity: ${projectId}/${dataset}`);
  const published = projects.filter((project) => project.isPublished);

  for (const [index, project] of published.entries()) {
    const base = `work/${project.slug}`;
    const [cover, preview, caseVideo, caseMobileVideo] = await Promise.all([
      upload("image", `${base}/cover.jpg`),
      upload("file", `${base}/preview.mp4`),
      upload("file", `${base}/case.mp4`),
      project.showcase.mobile === false ? undefined : upload("file", `${base}/case-mobile.mp4`),
    ]);
    if (!cover) {
      console.warn(`  пропущен ${project.slug}: нет ${base}/cover.jpg (pnpm covers)`);
      continue;
    }

    const id = `project-${project.slug}`;
    await client.createIfNotExists({ _id: id, _type: "project", title: project.title });
    await client
      .patch(id)
      .setIfMissing({ summary: { _type: "localeText" }, role: { _type: "localeString" } })
      .commit();
    await client
      .patch(id)
      .set({
        title: project.title,
        slug: { _type: "slug", current: project.slug },
        "summary.en": project.summary,
        "role.en": project.role,
        category: project.category,
        year: project.year,
        stack: project.stack,
        liveUrl: project.liveUrl,
        repoUrl: project.repoUrl,
        cover,
        published: true,
        featured: project.isFeatured,
        inCarousel: project.inCarousel,
        order: (index + 1) * 10,
        ...(project.client ? { client: project.client } : {}),
        ...(preview ? { preview } : {}),
        ...(caseVideo ? { caseVideo } : {}),
        ...(caseMobileVideo ? { caseMobileVideo } : {}),
      })
      .commit();

    // Пункты «Что сделано»: английский заменяется, переводы по тем же пунктам остаются
    const current = await client.getDocument<{ highlights?: { _key: string }[] }>(id);
    const keys = current?.highlights?.map((item) => item._key) ?? [];
    const highlights = project.highlights.map((en, i) => ({
      ...(current?.highlights?.[i] ?? {}),
      _key: keys[i] ?? `h${i}`,
      _type: "localeText",
      en,
    }));
    await client.patch(id).set({ highlights }).commit();

    console.log(`  ✓ ${project.title}`);
  }

  await client.createIfNotExists({
    _id: "settings",
    _type: "settings",
    available: true,
    socials: [{ _key: "github", _type: "social", name: "GitHub", url: "https://github.com/srg201" }],
    careerStart: career.start,
    projectsCount: career.projects,
  });
  console.log("  ✓ Настройки сайта");
  console.log("Готово. Откройте /admin, чтобы проверить и добавить переводы.");
}

main().catch((error) => {
  console.error("✕", error instanceof Error ? error.message : error);
  process.exit(1);
});
