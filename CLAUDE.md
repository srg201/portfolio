# Портфолио Сергея Белякова

Сергей Беляков, full-stack веб-разработчик. Это его личный сайт-портфолио: motion-сайт уровня Awwwards, вдохновлённый https://www.psychoactive.co.nz/ (не копия).

Полный план (секции, эффекты, схема БД, этапы): @docs/PLAN.md

## Ключевые решения (уже приняты, не пересматривать)
- Next.js 16 App Router (`cacheComponents`, React Compiler, Turbopack) + TypeScript strict + Tailwind v4. Пакетный менеджер pnpm.
- В Next 16 `middleware.ts` называется `proxy.ts`. Локаль на сервере читается через `next/root-params` (см. `i18n/request.ts`), а не через `requestLocale`/`setRequestLocale`.
- Supabase: БД, Auth, Storage. Контент переводится через таблицы `*_translations`.
- ORM: Drizzle (1.0 RC). Схема и RLS-политики в `lib/db/schema.ts`, миграции через `pnpm db:generate` / `db:migrate` в папку `drizzle/`. Drizzle на сервере обходит RLS, поэтому публичные запросы сами фильтруют `is_published`. supabase-js используется для Auth и Storage.
- Supabase Auth-сессия обновляется в `proxy.ts` только для `/admin`; публичный сайт статический и cookies не читает.
- next-intl, 15 языков: en, zh, es, hi, ar (RTL), pt, ru, fr, de, ja, ko, pl, tr, it, uk; fallback `en`. Язык определяется автоматически по `Accept-Language`, ручной выбор хранится в cookie. URL с префиксом `/{locale}`.
- next-themes: светлая и тёмная тема плюс system, по умолчанию тёмная. Цвета только через CSS-переменные.
- Анимации: Motion (UI), GSAP + ScrollTrigger + SplitText (скролл), Lenis (плавный скролл), R3F/OGL (WebGL-туман).
- Админка `/admin` с автопереводом контента через Claude API.
- Деплой на Vercel.

## Правила
- Общение с владельцем на русском.
- Ни одной захардкоженной UI-строки: всё через `messages/{locale}.json`.
- UI-компоненты: shadcn/ui (стиль base-nova, Base UI, `components.json`, RTL включён). Тема shadcn в `app/globals.css` построена от фирменного оранжевого: `primary` для кнопок и ссылок, `brand` для акцентного текста и декора, `accent` означает тёплый фон наведения (это НЕ фирменный цвет). Есть также `success`, `warning`, `destructive`. Пары «текст / фон» держат контраст WCAG AA.
- Используем логические CSS-свойства (`ms-`/`me-`/`ps-`/`pe-`), чтобы работал RTL.
- Каждая анимация учитывает `prefers-reduced-motion`.
- Секреты только в `.env.local` (он в `.gitignore`), в репозиторий и в чат не попадают; переменные описываются в `.env.example`.

## Текущий статус
Этап 1 (каркас) готов локально: Next.js, next-intl (15 локалей, proxy, RTL, cookie), next-themes, Supabase-клиенты, Drizzle, `.env.example`. Осталось: заполнить `.env.local` ключами Supabase и задеплоить на Vercel. Дальше этап 2 (дизайн-система). Цвета в `app/globals.css` и шрифт Geist временные.
