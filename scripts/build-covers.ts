/**
 * Обложки, превью и записи для карточек работ и кейсов (сначала `pnpm showcases`).
 *
 *   pnpm covers
 *
 * Записи шоукейсов тяжёлые и лежат в .gitignore. Отсюда в репозиторий
 * попадают лёгкие версии, public/work/{slug}/:
 * - cover.jpg: кадр 1280×800 для опубликованных проектов,
 *   next/image сам отдаст WebP/AVIF нужной ширины;
 * - preview.mp4: петля ~6 с, 960×600, без звука, играет при наведении
 *   на карточку;
 * - case.mp4 и case-mobile.mp4: вся запись (десктоп 1280×800 и телефон
 *   540×920), без звука, для блока «В движении» на странице кейса.
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

const kb = async (file: string) => Math.round((await stat(file)).size / 1024);

function encode(source: string, target: string, filter: string, args: string[] = []) {
  ffmpeg([
    ...args,
    "-i", source,
    "-vf", `fps=24,${filter},format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "30",
    "-movflags", "+faststart", "-an",
    target,
  ]);
}

async function main() {
  for (const { slug, isPublished, showcase } of projects) {
    if (!isPublished) continue;
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
    encode(source, preview, "scale=960:600:flags=lanczos", [
      "-ss", String(START),
      "-t", String(PREVIEW_LENGTH),
    ]);

    const full = path.join(dir, "case.mp4");
    encode(source, full, "scale=1280:800:flags=lanczos");

    const sizes = [`cover ${await kb(cover)}`, `preview ${await kb(preview)}`, `case ${await kb(full)}`];
    const mobileSource = path.join(SHOWCASES, slug, "mobile.mp4");
    if (showcase.mobile !== false && existsSync(mobileSource)) {
      const mobile = path.join(dir, "case-mobile.mp4");
      encode(mobileSource, mobile, "scale=540:920:flags=lanczos");
      sizes.push(`case-mobile ${await kb(mobile)}`);
    }
    console.log(`✓ ${slug}: ${sizes.join(", ")} КБ`);
  }
}

main();
