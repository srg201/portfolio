/**
 * Спираль проектов: раскладка карточек (project-ring.tsx) в 3D.
 *
 * Каждая карточка стоит в точке t ∈ [0, 1) пути. Путь: виток спирали,
 * который начинается слева, проходит внизу перед зрителем, поднимается
 * справа и уходит вдаль к верху экрана. Сдвиг `shift` двигает все
 * карточки по пути (скролл и медленный дрейф), у концов пути они гаснут,
 * поэтому перескок с конца в начало не виден.
 *
 * `scatter` (0..1): спираль разлетается на камеру перед карточками работ.
 * Карточка `handoff` при этом скрыта: вместо неё летит копия (hero-motion.tsx).
 */

/** Угол начала и длина витка, градусы */
const START = -110;
const SWEEP = 310;
/** Где на пути стоит карточка 0 при shift = 0: ровно перед зрителем (угол 0) */
const FRONT = -START / SWEEP;

export type RingState = {
  shift: number;
  scatter: number;
  handoff: HTMLElement | null;
};

export type Ring = {
  stage: HTMLElement;
  cards: HTMLElement[];
  state: RingState;
  apply: () => void;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const fract = (value: number) => value - Math.floor(value);

export function createRing(root: HTMLElement): Ring | null {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  if (!stage) return null;
  const cards = [...stage.querySelectorAll<HTMLElement>("[data-ring-card]")];
  const state: RingState = { shift: 0, scatter: 0, handoff: null };

  const apply = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const narrow = width < 768;
    // В RTL спираль зеркальна: начинается справа
    const dir = getComputedStyle(stage).direction === "rtl" ? -1 : 1;
    const radius = narrow ? width * 0.58 : Math.min(width * 0.4, height * 0.62);
    const tilt = height * (narrow ? 0.24 : 0.2);
    const count = cards.length;
    const scatter = state.scatter;

    cards.forEach((card, index) => {
      const t = fract(FRONT + index / count - state.shift);
      const angle = ((START + SWEEP * t) * Math.PI) / 180;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      let x = sin * radius * dir;
      // Наклон витка плюс подъём вдоль пути: дальний конец уходит вверх
      let y = cos * tilt + (0.1 - 0.32 * t) * height;
      let z = cos * radius * 0.9 - radius * 0.25;
      let opacity =
        clamp01(t / 0.1) * clamp01((1 - t) / 0.15) * (0.35 + 0.65 * ((cos + 1) / 2));

      if (card === state.handoff && scatter > 0) {
        opacity = 0;
      } else if (scatter > 0) {
        x *= 1 + scatter * 1.4;
        y *= 1 + scatter;
        z += scatter * 600;
        opacity *= (1 - scatter) ** 2;
      }

      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      card.style.opacity = opacity.toFixed(3);
    });
  };

  apply();
  return { stage, cards, state, apply };
}

/** Карточка-кандидат для перелёта, которая сейчас виднее остальных */
export function pickHandoff(ring: Ring) {
  let best: HTMLElement | null = null;
  let bestOpacity = -1;
  for (const card of ring.cards) {
    if (!card.hasAttribute("data-ring-handoff")) continue;
    const opacity = Number(card.style.opacity) || 0;
    if (opacity > bestOpacity) {
      best = card;
      bestOpacity = opacity;
    }
  }
  return best;
}
