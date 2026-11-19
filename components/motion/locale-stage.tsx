"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/*
 * Анимация смены языка.
 * LocaleSwitcher вызывает startLocaleLeave(): текущая страница растворяется.
 * Next монтирует страницу новой локали заново (старая уходит в скрытый <Activity>),
 * а React при этом сбрасывает атрибуты <html>. Поэтому флаг хранится в модуле,
 * а состояние пишется в data-locale-stage самого контейнера.
 * Стили: globals.css, блок «Смена языка».
 */
const LEAVE_FALLBACK_MS = 4000;
const STAGE = "[data-locale-stage]";

let pendingEnter = false;

export function startLocaleLeave() {
  pendingEnter = true;
  const stages = document.querySelectorAll<HTMLElement>(STAGE);
  stages.forEach((stage) => (stage.dataset.localeStage = "leaving"));

  // Если навигация сорвётся, страница не должна остаться невидимой
  window.setTimeout(() => {
    pendingEnter = false;
    stages.forEach((stage) => {
      if (stage.dataset.localeStage === "leaving") stage.dataset.localeStage = "";
    });
  }, LEAVE_FALLBACK_MS);
}

export function LocaleStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // До отрисовки, чтобы новая страница не мелькнула без анимации
  useLayoutEffect(() => {
    const stage = ref.current;
    // Повторный запуск эффекта (StrictMode, показ из <Activity>) не должен
    // обрывать уже идущую анимацию входа
    if (!stage || !pendingEnter) return;
    stage.dataset.localeStage = "entering";
    pendingEnter = false;
  }, []);

  return (
    <div
      ref={ref}
      data-locale-stage=""
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.dataset.localeStage = "";
        }
      }}
      className="flex flex-1 flex-col"
    >
      {children}
    </div>
  );
}
