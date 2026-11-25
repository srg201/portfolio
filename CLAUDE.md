# Портфолио Сергея Белякова

Сергей Беляков, full-stack веб-разработчик. Это его личный сайт-портфолио: motion-сайт уровня Awwwards, вдохновлённый https://www.psychoactive.co.nz/ (не копия).

Полный план (секции, эффекты, схема БД, этапы): @docs/PLAN.md

## Ключевые решения (уже приняты, не пересматривать)
- Next.js 16 App Router (`cacheComponents`, React Compiler, Turbopack) + TypeScript strict + Tailwind v4. Пакетный менеджер pnpm.
- В Next 16 `middleware.ts` называется `proxy.ts`. Локаль на сервере читается через `next/root-params` (см. `i18n/request.ts`), а не через `requestLocale`/`setRequestLocale`.
- Контент (проекты, настройки сайта) в Sanity: админка Sanity Studio на `/admin` (решение владельца, заменило план админки на Supabase). Схема в `sanity/schemaTypes/`, конфиг `sanity.config.ts`. Переводы: поля `localeString`/`localeText` (английский обязателен, остальные 14 языков опциональны, на сайте откат на английский). Сайт читает контент только через `lib/content` (кеш `"use cache"` + тег `sanity`, сброс вебхуком `/api/revalidate`); без `NEXT_PUBLIC_SANITY_PROJECT_ID` или при пустом датасете берёт `lib/mock`.
- Supabase (БД, Auth, Storage) остаётся для будущих данных вроде заявок.
- ORM: Drizzle (1.0 RC). Схема и RLS-политики в `lib/db/schema.ts`, миграции через `pnpm db:generate` / `db:migrate` в папку `drizzle/`. Drizzle на сервере обходит RLS, поэтому публичные запросы сами фильтруют `is_published`. supabase-js используется для Auth и Storage.
- `proxy.ts` только про языки; `/admin` и `/api` вне локалей. Публичный сайт статический и cookies не читает.
- next-intl, 15 языков: en, zh, es, hi, ar (RTL), pt, ru, fr, de, ja, ko, pl, tr, it, uk; fallback `en`. Язык определяется автоматически по `Accept-Language`, ручной выбор хранится в cookie. URL с префиксом `/{locale}`.
- next-themes: светлая и тёмная тема плюс system, по умолчанию тёмная. Цвета только через CSS-переменные.
- Анимации: Motion (UI), GSAP + ScrollTrigger + SplitText (скролл), Lenis (плавный скролл), R3F/OGL (WebGL-туман).
- Безопасность: заголовки и CSP в `next.config.ts` (отдельная политика для `/admin`), лимиты и проверки в форме заявки.
- Деплой на Vercel.

## Правила
- Общение с владельцем на русском.
- Ни одной захардкоженной UI-строки: всё через `messages/{locale}.json`.
- UI-компоненты: shadcn/ui (стиль base-nova, Base UI, `components.json`, RTL включён). Тема shadcn в `app/globals.css` построена от фирменного оранжевого: `primary` для кнопок и ссылок, `brand` для акцентного текста и декора, `accent` означает тёплый фон наведения (это НЕ фирменный цвет). Есть также `success`, `warning`, `destructive`. Пары «текст / фон» держат контраст WCAG AA.
- Используем логические CSS-свойства (`ms-`/`me-`/`ps-`/`pe-`), чтобы работал RTL.
- Каждая анимация учитывает `prefers-reduced-motion`.
- Секреты только в `.env.local` (он в `.gitignore`), в репозиторий и в чат не попадают; переменные описываются в `.env.example`.

## Текущий статус
- Этап 1 (каркас) готов: Next.js, next-intl (15 локалей, proxy, RTL, cookie), next-themes, Supabase-клиенты, Drizzle, `.env.example`. `.env.local` заполнен. Не сделано: деплой на Vercel (там нужно задать те же переменные, минимум `GMAIL_USER_NAME` и `GMAIL_APP_PASSWORD`).
- Сделаны:
  - тема shadcn от фирменного оранжевого и WebGL-туман;
  - Dock с переключателями языка и темы;
  - главная (`components/sections/`): hero-композиция (роль, меняющееся слово, CTA, имя) с 3D-каруселью обложек проектов в полосе между верхним рядом и именем (`project-ring.tsx`, раскладка в `ring-motion.ts`, текст не перекрывает); при скролле карусель расходится, и карточка первой работы перелетает в секцию работ (большая карточка и пары в 2 колонки, `#work`) → услуги (превью примера сбоку от курсора) → стек → процесс. Шоурил с главной убран, скрипты `pnpm showreel` и файлы в `public/showreel` остались;
  - футер с финальным CTA в layout. Отзывы пропущены, пока нет настоящих текстов;
  - полировка: reduced motion, клавиатура, hreflang/canonical (`lib/seo.ts`), LCP;
  - страницы `/work` (фильтры, сетка ↔ список) и `/work/[slug]` (кейс с видео), `/about`, `/contact`;
  - квиз на `/contact`: заявка уходит письмом владельцу через Gmail SMTP (`lib/mail.ts`, шаблон `lib/lead-email.ts`, проверка `pnpm mail:check`). Ловушки для ботов: скрытое поле и минимальное время. Resend не используем. У владельца включён VPN, который режет SMTP, поэтому локально письма не уходят, на Vercel уйдут. Бюджеты рассчитаны на старт: до $300 … $1500+. В Supabase заявки пока не сохраняются;
  - полноэкранное меню из Dock (`components/ui/menu.tsx`), переход страниц шторкой (`template.tsx`), preloader первого захода, 404 с «логом деплоя», `sitemap.xml`, `robots.txt`, OG-картинка.
- Данные: Sanity, а до его подключения `lib/mock/projects.ts`, `lib/career.ts`. Перенос моков в Sanity: `pnpm sanity:seed`. Записи проектов: `pnpm showcases`, обложки: `pnpm covers`.
- Шрифт Geist временный.
- Публичный email владельца: в `lib/content` (по умолчанию) и в настройках Sanity. Ждём от владельца: фото, таймлайн, CV, настоящие отзывы.
- Дальше: подключить проект Sanity (ключи в `.env.local` и Vercel, вебхук), автоперевод в Studio через Claude API, заявки в Supabase.
