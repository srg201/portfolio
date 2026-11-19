/**
 * Обложки и превью для карточек работ (сначала `pnpm showcases`).
 *
 *   pnpm covers
 *
 * Записи шоукейсов тяжёлые и лежат в .gitignore. Отсюда в репозиторий
 * попадают лёгкие версии для избранных проектов, public/work/{slug}/:
 * - cover.jpg: кадр 1280×800, next/image сам отдаст WebP/AVIF нужной ширины;
 * - preview.mp4: петля ~6 с, 960×600, без звука, играет при наведении.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { projects } from "../lib/mock/projects";

const SHOWCASES = path.join(process.cwd(), "public", "showcases");
const OUT = path.join(process.cwd(), "public", "work");
/** Сайт уже проиграл свой вход */
const START = 1.2;
const PREVIEW_LENGTH = 6;
const COVER_AT = 0.4;

function ffmpeg(args: string[]) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });
}

async function main() {
  const featured = projects.filter((project) => project.isFeatured);

  for (const { slug } of featured) {
    const source = path.join(SHOWCASES, slug, "desktop.mp4");
    if (!existsSync(source)) {
      console.warn(`– ${slug}: нет записи, сначала pnpm showcases ${slug}`);
      continue;
    }
    const dir = path.join(OUT, slug);
    await mkdir(dir, { recursive: true });

    const cover = path.join(dir, "cover.jpg");
    ffmpeg(["-ss", String(COVER_AT), "-i", source, "-frames:v", "1", "-q:v", "3", cover]);

    const preview = path.join(dir, "preview.mp4");
    ffmpeg([
      "-ss", String(START),
      "-t", String(PREVIEW_LENGTH),
      "-i", source,
      "-vf", "fps=24,scale=960:600:flags=lanczos,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", "30",
      "-movflags", "+faststart", "-an",
      preview,
    ]);

    const kb = async (file: string) => Math.round((await stat(file)).size / 1024);
    console.log(`✓ ${slug}: cover ${await kb(cover)} КБ, preview ${await kb(preview)} КБ`);
  }
}

main();
