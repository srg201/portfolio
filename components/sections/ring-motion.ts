/**
 * Карусель проектов в hero: раскладка карточек (project-ring.tsx) в 3D.
 *
 * Карточки стоят по горизонтальному кольцу, на которое смотрим чуть сверху:
 * передние ниже и крупнее, задние выше, мельче и тусклее. Размер карточек
 * и радиусы считаются от полосы, в которой стоит кольцо, так что карусель
 * целиком помещается между верхним рядом hero и именем и не заходит на текст.
 * `shift` (доля оборота) вращает кольцо: дрейф и скролл.
 *
 * `scatter` (0..1): кольцо разлетается в стороны при уходе со сцены.
 * Карточка `handoff` при этом скрыта: вместо неё летит копия (hero-motion.tsx).
 */

/** Перспектива сцены, px: как .ring-stage в globals.css */
const PERSPECTIVE = 1400;
/** Глубина кольца, px: передняя карточка ближе к зрителю на столько */
const DEPTH = 220;
const FRONT_SCALE = PERSPECTIVE / (PERSPECTIVE - DEPTH);

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

export function createRing(root: HTMLElement): Ring | null {
  const stage = root.querySelector<HTMLElement>("[data-ring]");
  if (!stage) return null;
  const cards = [...stage.querySelectorAll<HTMLElement>("[data-ring-card]")];
  const state: RingState = { shift: 0, scatter: 0, handoff: null };

  const apply = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    // В RTL вращение в другую сторону
    const dir = getComputedStyle(stage).direction === "rtl" ? -1 : 1;

    // Карточка 16:10: по высоте полосы, но не шире трети экрана
    let cardWidth = Math.min(height * 0.42 * 1.6, width * 0.3, 300);
    const cardHeight = cardWidth / 1.6;
    // Наклон: передняя карточка касается низа полосы, но не выходит за него
    // Наклон мягкий: кольцо читается как ровная лента, а не как веер
    const tilt = Math.max(0, (height / 2 / FRONT_SCALE - cardHeight / 2) * 0.55);
    const radius = Math.max(0, width / 2 - cardWidth * 0.55 - 8);
    if (radius === 0) cardWidth = 0;

    const count = cards.length;
    const scatter = state.scatter;

    cards.forEach((card, index) => {
      const angle = 2 * Math.PI * (index / count - state.shift) * dir;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      let x = sin * radius;
      const y = cos * tilt;
      let z = cos * DEPTH;
      // Задние карточки тусклые, передние полностью видны
      let opacity = 0.18 + 0.82 * ((cos + 1) / 2) ** 1.5;

      if (card === state.handoff && scatter > 0) {
        opacity = 0;
      } else if (scatter > 0) {
        // Разлёт в стороны, в пределах своей полосы: на текст не заходит
        x *= 1 + scatter * 1.6;
        z += scatter * 160;
        opacity *= (1 - scatter) ** 3;
      }

      card.style.width = `${cardWidth.toFixed(1)}px`;
      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      card.style.opacity = opacity.toFixed(3);
    });
  };

  apply();
  return { stage, cards, state, apply };
}

/** Карточка-кандидат для перелёта, которая сейчас ближе всех к зрителю */
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
