/**
 * Запись шоукейсов проектов: плавная прокрутка живого сайта → MP4 + постер.
 *
 *   pnpm showcases            # все проекты из lib/mock/projects.ts
 *   pnpm showcases outpost    # только выбранные slug
 *
 * Нужны установленный Google Chrome и ffmpeg (brew install ffmpeg).
 * Кадры снимаются через CDP screencast с реальными метками времени, поэтому
 * анимации сайтов идут в своём темпе, а итоговое видео собирается в 30 fps.
 * Результат: public/showcases/{slug}/desktop.mp4, mobile.mp4, poster.jpg
 */
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, devices, type Browser } from "playwright-core";
import { projects, type MockProject } from "../lib/mock/projects";

const OUT_DIR = path.join(process.cwd(), "public", "showcases");
const FPS = 30;
/** Пауза на первом экране, пока проигрывается вход сайта, с */
const HOLD_START = 2;
const HOLD_END = 1;

type Variant = "desktop" | "mobile";

const VARIANTS: Record<
  Variant,
  { context: Parameters<Browser["newContext"]>[0]; outWidth: number }
> = {
  desktop: {
    context: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    },
    outWidth: 1280,
  },
  mobile: {
    context: { ...devices["iPhone 13"] },
    outWidth: 540,
  },
};

type Frame = { data: string; timestamp: number };

const SCROLL_SCRIPT = `function (depth, seconds) {
  return new Promise(function (resolve) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var target = Math.max(0, max * depth);
    var start = performance.now();
    function step(now) {
      var t = Math.min(1, (now - start) / (seconds * 1000));
      var eased = -(Math.cos(Math.PI * t) - 1) / 2;
      window.scrollTo(0, target * eased);
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}`;

async function recordVariant(
  browser: Browser,
  project: MockProject,
  variant: Variant,
) {
  const { context: contextOptions, outWidth } = VARIANTS[variant];
  const context = await browser.newContext({
    ...contextOptions,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    // Сайты с автоопределением языка иначе подхватят язык системы
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const page = await context.newPage();

  try {
    await page
      .goto(project.liveUrl, { waitUntil: "networkidle", timeout: 45_000 })
      .catch(() => page.goto(project.liveUrl, { waitUntil: "load" }));

    // Без полос прокрутки в кадре
    await page.addStyleTag({
      content:
        "html{scrollbar-width:none}::-webkit-scrollbar{display:none!important}",
    });

    const viewport = page.viewportSize()!;
    const scale = contextOptions?.deviceScaleFactor ?? 1;
    const cdp = await context.newCDPSession(page);
    const frames: Frame[] = [];

    cdp.on("Page.screencastFrame", (frame) => {
      frames.push({ data: frame.data, timestamp: frame.metadata.timestamp! });
      cdp
        .send("Page.screencastFrameAck", { sessionId: frame.sessionId })
        .catch(() => {});
    });

    await cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 92,
      maxWidth: viewport.width * scale,
      maxHeight: viewport.height * scale,
      everyNthFrame: 1,
    });

    await page.waitForTimeout(HOLD_START * 1000);

    if (variant === "desktop") {
      await mkdir(path.join(OUT_DIR, project.slug), { recursive: true });
      await page.screenshot({
        path: path.join(OUT_DIR, project.slug, "poster.jpg"),
        type: "jpeg",
        quality: 85,
      });
    }

    // Плавная прокрутка внутри страницы (easeInOutSine по requestAnimationFrame).
    // Код передаётся строкой: tsx/esbuild добавляет в функции хелпер __name,
    // которого нет в браузере
    await page.evaluate(
      `(${SCROLL_SCRIPT})(${project.showcase.scrollDepth}, ${project.showcase.scrollSeconds})`,
    );

    await page.waitForTimeout(HOLD_END * 1000);
    await cdp.send("Page.stopScreencast");

    if (frames.length < 10) {
      throw new Error(`слишком мало кадров (${frames.length})`);
    }

    await encode(
      frames,
      path.join(OUT_DIR, project.slug, `${variant}.mp4`),
      outWidth,
    );
    return frames.length;
  } finally {
    await context.close();
  }
}

/** Кадры с реальными метками времени → MP4 (H.264, 30 fps, faststart) */
async function encode(frames: Frame[], output: string, width: number) {
  const dir = await mkdtemp(path.join(tmpdir(), "showcase-"));
  try {
    const lines = ["ffconcat version 1.0"];
    for (const [index, frame] of frames.entries()) {
      const file = path.join(dir, `${String(index).padStart(5, "0")}.jpg`);
      await writeFile(file, Buffer.from(frame.data, "base64"));
      const next = frames[index + 1];
      const duration = next ? next.timestamp - frame.timestamp : 1 / FPS;
      lines.push(
        `file '${file}'`,
        `duration ${Math.max(duration, 0.001).toFixed(4)}`,
      );
    }
    // ffconcat требует повторить последний кадр, чтобы учесть его длительность
    lines.push(
      `file '${path.join(dir, `${String(frames.length - 1).padStart(5, "0")}.jpg`)}'`,
    );
    const list = path.join(dir, "list.txt");
    await writeFile(list, lines.join("\n"));

    await mkdir(path.dirname(output), { recursive: true });
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        list,
        "-vf",
        `fps=${FPS},scale=${width}:-2:flags=lanczos`,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        output,
      ],
      { stdio: "inherit" },
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function main() {
  const only = process.argv.slice(2);
  const selected = only.length
    ? projects.filter((project) => only.includes(project.slug))
    : projects;

  if (!selected.length) {
    console.error(`Нет проектов с slug: ${only.join(", ")}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const failures: string[] = [];

  try {
    for (const project of selected) {
      for (const variant of ["desktop", "mobile"] as const) {
        const label = `${project.slug}/${variant}`;
        if (variant === "mobile" && project.showcase.mobile === false) {
          console.log(`– ${label}: пропущено (mobile: false)`);
          continue;
        }
        try {
          const count = await recordVariant(browser, project, variant);
          console.log(`✓ ${label}: ${count} кадров`);
        } catch (error) {
          failures.push(label);
          console.error(`✗ ${label}: ${(error as Error).message}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error(`Не записано: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main();
