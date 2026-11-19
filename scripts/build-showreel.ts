/**
 * Сборка шоурила из записей шоукейсов (сначала `pnpm showcases`).
 *
 *   pnpm showreel
 *
 * Берёт записи избранных проектов, из каждой вырезает отрезок (первый экран
 * и начало прокрутки) и склеивает их плавными переходами. Две версии:
 * - desktop: 1280×800 из desktop.mp4;
 * - mobile: 540×920 из mobile.mp4, вертикальная, для узких экранов.
 * У мобильной версии отрезки чуть длиннее, если записей меньше: длительность
 * обеих версий совпадает, и подпись «0:22» верна на любом экране.
 *
 * Результат: public/showreel/{reel,reel-mobile}.mp4, poster(-mobile).jpg
 * и lib/showreel.ts с путями и длительностью.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects } from "../lib/mock/projects";

const SHOWCASES = path.join(process.cwd(), "public", "showcases");
const OUT_DIR = path.join(process.cwd(), "public", "showreel");
/** С какой секунды записи начинается отрезок: сайт уже проиграл свой вход */
const SEGMENT_START = 1.2;
const SEGMENT_LENGTH = 5;
const FADE = 0.7;
const FPS = 30;

const VARIANTS = {
  desktop: { source: "desktop.mp4", width: 1280, height: 800, suffix: "" },
  mobile: { source: "mobile.mp4", width: 540, height: 920, suffix: "-mobile" },
} as const;

type Variant = keyof typeof VARIANTS;

function run(args: string[]) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });
}

function probeDuration(file: string) {
  const output = execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    file,
  ]);
  return Number(output.toString().trim());
}

function clipsFor(variant: Variant) {
  return projects
    .filter((project) => project.isFeatured)
    .map((project) =>
      path.join(SHOWCASES, project.slug, VARIANTS[variant].source),
    )
    .filter((file) => existsSync(file));
}

/** Длина отрезка, при которой n отрезков с переходами дают нужную длительность */
function segmentLengthFor(count: number, total: number) {
  return (total + (count - 1) * FADE) / count;
}

function buildReel(variant: Variant, clips: string[], segment: number) {
  const { width, height, suffix } = VARIANTS[variant];
  const filters = clips.map(
    (_, index) =>
      `[${index}:v]trim=start=${SEGMENT_START}:duration=${segment.toFixed(3)},` +
      `setpts=PTS-STARTPTS,fps=${FPS},` +
      `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height},format=yuv420p[v${index}]`,
  );

  // Цепочка xfade: каждый следующий отрезок наплывает на предыдущий
  let previous = "v0";
  for (let index = 1; index < clips.length; index++) {
    const offset = (index * (segment - FADE)).toFixed(3);
    const label = index === clips.length - 1 ? "out" : `x${index}`;
    filters.push(
      `[${previous}][v${index}]xfade=transition=fade:duration=${FADE}:offset=${offset}[${label}]`,
    );
    previous = label;
  }

  const reel = path.join(OUT_DIR, `reel${suffix}.mp4`);
  run([
    ...clips.flatMap((file) => ["-i", file]),
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[out]",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    reel,
  ]);
  run([
    "-ss",
    "0.5",
    "-i",
    reel,
    "-frames:v",
    "1",
    "-q:v",
    "4",
    path.join(OUT_DIR, `poster${suffix}.jpg`),
  ]);

  const duration = probeDuration(reel);
  console.log(
    `✓ ${path.relative(process.cwd(), reel)}: ${clips.length} проектов, ${duration.toFixed(1)} с`,
  );
  return duration;
}

async function main() {
  const desktop = clipsFor("desktop");
  const mobile = clipsFor("mobile");

  if (desktop.length < 2 || mobile.length < 2) {
    console.error(
      "Нужно хотя бы 2 записи каждого вида: сначала pnpm showcases",
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const desktopDuration = buildReel("desktop", desktop, SEGMENT_LENGTH);
  const mobileSegment = segmentLengthFor(mobile.length, desktopDuration);
  if (SEGMENT_START + mobileSegment > 10) {
    console.warn("Мобильные отрезки длиннее 10 с: добавьте мобильных записей");
  }
  buildReel("mobile", mobile, mobileSegment);

  await writeFile(
    path.join(process.cwd(), "lib", "showreel.ts"),
    `// Сгенерировано scripts/build-showreel.ts, не редактировать вручную\n` +
      `export const showreel = {\n` +
      `  src: "/showreel/reel.mp4",\n` +
      `  poster: "/showreel/poster.jpg",\n` +
      `  /** Вертикальная версия для узких экранов */\n` +
      `  srcMobile: "/showreel/reel-mobile.mp4",\n` +
      `  posterMobile: "/showreel/poster-mobile.jpg",\n` +
      `  /** Длительность, с */\n` +
      `  duration: ${Math.round(desktopDuration)},\n` +
      `} as const;\n`,
  );
}

main();
