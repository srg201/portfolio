import Image from "next/image";
import { projects } from "@/lib/mock/projects";

const CARDS = 10;

/** Первая избранная работа: её карточка из карусели перелетает в секцию работ */
const handoff = projects.find((project) => project.isFeatured)!;
const handoffCover = `/work/${handoff.slug}/cover.jpg`;

/**
 * Карусель обложек проектов в hero: горизонтальное кольцо в полосе между
 * верхним рядом и именем, текст не перекрывает. Раскладку и вращение
 * считает ring-motion.ts, движение запускает hero-motion.tsx.
 * При скролле карусель разлетается, а карточка первой работы перелетает
 * на своё место в секции работ (RingProxy).
 * Без анимаций: статичное кольцо.
 */
export function ProjectRing() {
  const covers = [
    ...projects
      .filter((project) => project.inCarousel)
      .map((project) => `/work/${project.slug}/cover.jpg`),
    "/work/portfolio/cover.jpg",
  ];
  const cards = Array.from(
    { length: CARDS },
    (_, index) => covers[index % covers.length]!,
  );

  return (
    <div
      aria-hidden
      data-ring
      className="ring-stage pointer-events-none absolute inset-y-0 -inset-x-4 min-[400px]:-inset-x-5 sm:-inset-x-6 md:-inset-x-10"
    >
      <div className="ring-scene absolute inset-0">
        {cards.map((src, index) => (
          <div
            key={index}
            data-ring-card
            data-ring-handoff={src === handoffCover || undefined}
            className="ring-card"
          >
            <div
              data-ring-inner
              className="relative size-full overflow-hidden rounded-lg bg-muted shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-foreground/10"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 20vw, 40vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Копия карточки первой работы для перелёта из карусели в секцию работ.
 * Лежит вне 3D-сцены: fixed, положение и размер пишет hero-motion.tsx.
 * Под текстом hero (z-0 против z-10): по пути проходит за именем, не поверх.
 */
export function RingProxy() {
  return (
    <div
      aria-hidden
      data-ring-proxy
      className="pointer-events-none invisible fixed top-0 left-0 z-0 overflow-hidden bg-muted motion-reduce:hidden"
    >
      <Image
        src={handoffCover}
        alt=""
        fill
        sizes="(min-width: 768px) 78vw, 100vw"
        className="object-cover object-top"
      />
    </div>
  );
}
