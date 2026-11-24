# План сайта-портфолио Сергея Белякова

Владелец: **Сергей Беляков**, full-stack веб-разработчик.
Цель: очень красивый motion-сайт-портфолио уровня Awwwards: работы, кейсы, услуги, контакт и заявки.

---

## 1. Референс

**Psychoactive Studios**: https://www.psychoactive.co.nz/ (разбор: https://www.awwwards.com/sites/psychoactive-studios-1)

У них Webflow + GSAP + WebGL (на Awwwards стоят теги Three.js, 3D, Transitions, Storytelling, Experimental).
Мы делаем **вдохновлённый** дизайн, а не копию: свой стиль, свои тексты и графика.
Точные цвета, шрифты и easing у референса ещё не проверены. Если нужны, смотреть вживую в DevTools.

### Что переносим

| Эффект у референса | Наша реализация |
|---|---|
| Живой «туман» под всеми страницами | Фоновый WebGL-шейдер (R3F или OGL): fluid / noise-туман, реагирует на курсор и скролл, цвет зависит от темы. Один canvas на весь layout, не пересоздаётся при смене страниц |
| Preloader при первом заходе | Счётчик 0→100 и имя «Sergey Belyakov», туман рассеивается и открывает hero. Только при первом визите (sessionStorage) |
| Showreel после hero | Видео с записями экранов проектов, растёт до fullscreen при скролле (GSAP ScrollTrigger + pin) |
| «Client orbit» | Логотипы технологий и клиентов на 3D-орбите; на скролле орбита «влетает» в первый кейс |
| Полноэкранное меню с превью | Fullscreen-меню; hover на пункт плавно показывает превью-картинку сзади |
| Карточка раскрывается в кейс | Shared-element переход: обложка из списка перетекает в hero кейса |
| Переход «туманом» между страницами | Туман сгущается, закрывает экран, на новой странице рассеивается |
| Звуки интерфейса | Тихие hover и клик (Howler.js), переключатель, **по умолчанию выключены** |
| Интерактивная 404 | Мини-игра или 3D-сцена («Страница ещё не задеплоена») |
| Hover-превью на логотипах клиентов | Над логотипом всплывает скрин проекта |
| Микро-взаимодействия | Магнитные кнопки, кастомный курсор, split-text заголовки, marquee |

Вместо их «AI-аудита» делаем **квиз «Оценить проект»**: тип (лендинг / сервис / магазин / web-app), бюджет, сроки, контакты. Ответы сохраняются заявкой в Supabase и уходят уведомлением на почту.

---

## 2. Секции и страницы

### Главная `/[locale]`
1. **Preloader**
2. **Hero**: «Sergey Belyakov — Full-stack developer», фраза-манифест, CTA «Обсудить проект». Split-text, туман за курсором.
3. **Showreel**: видео проектов, scale-on-scroll.
4. **Tech / client orbit**: переход к работам.
5. **Избранные работы** (featured, 4–6 шт.): горизонтальный скролл с pin, clip-path reveal, parallax.
6. **Услуги**: Frontend, Backend / API, Full-stack продукты, WebGL / motion-сайты, E-commerce. Аккордеон, превью за курсором.
7. **Стек**: технологии (marquee или сетка с иконками).
8. **Процесс**: пронумерованные шаги (бриф → дизайн → разработка → запуск → поддержка), линия рисуется при скролле.
9. **Цифры**: годы опыта, проекты, клиенты, Lighthouse-скор. Счётчики.
10. **Отзывы**: слайдер.
11. **CTA и квиз «Оценить проект»**.
12. **Footer**: большой CTA, email, соцсети (GitHub, LinkedIn, Telegram), выбор языка и темы, reveal-footer.

### `/[locale]/work`: все работы
Фильтры по категориям, переключение сетка ↔ список, hover-превью за курсором, анимированная перестройка (Motion layout).

### `/[locale]/work/[slug]`: кейс
Hero с shared-element переходом → мета (год, клиент, роль, стек, сроки) → задача / решение / результат → галерея (full / half / third, видео, до/после) → метрики (Lighthouse, конверсия, скорость) → ссылки Live и GitHub → «Следующий проект» (доскролл переводит дальше).

### `/[locale]/about`
Биография, фото, таймлайн карьеры, ценности, FAQ, CV в PDF.

### `/[locale]/lab` (опционально)
Эксперименты: шейдеры, демо-анимации, open-source.

### `/[locale]/contact`
Форма и квиз, соцсети.

### `/admin`
Закрытая админка, см. раздел 6.

---

## 3. Мультиязычность (next-intl)

### Языки (15, расширяемо)
`en` English · `zh` 中文 · `es` Español · `hi` हिन्दी · `ar` العربية (RTL) · `pt` Português · `ru` Русский · `fr` Français · `de` Deutsch · `ja` 日本語 · `ko` 한국어 · `pl` Polski · `tr` Türkçe · `it` Italiano · `uk` Українська

Fallback-язык: `en`.

### Логика
- **Автоопределение:** middleware читает `Accept-Language` и перенаправляет на `/{locale}`.
- **Ручная смена:** переключатель в шапке, меню и футере; выбор запоминается в cookie `NEXT_LOCALE` и важнее языка браузера.
- **URL с префиксом** `/de/work/slug`; `hreflang`, мультиязычный `sitemap.xml`, OG-картинки на каждом языке.
- **RTL:** для `ar` выставляется `dir="rtl"`, используются логические CSS-свойства (`ms-`, `me-`, `ps-`, `pe-`), горизонтальные анимации зеркалятся.
- **Шрифты:** основной latin + cyrillic; Noto Sans SC / JP / KR / Devanagari / Arabic подгружаются **только** для своей локали (`next/font`).
- Числа и даты форматируются через `Intl` / форматтеры next-intl.

### Где хранятся переводы
- **UI-строки:** `messages/{locale}.json`.
- **Контент:** Supabase, таблицы `*_translations` (см. раздел 5).
- **Автоперевод в админке:** контент пишется на одном языке, кнопка «Перевести на все языки» вызывает server action с Claude API (модель `claude-sonnet-5-5`; при желании DeepL). Результат записывается во все локали с флагом `is_auto = true`, каждый перевод можно поправить вручную.

---

## 4. Темы (next-themes)

- Режимы: light / dark / system (по умолчанию system), `attribute="class"`.
- Цвета только через CSS-переменные и токены Tailwind, никаких захардкоженных цветов в компонентах.
- Без мигания при загрузке (`suppressHydrationWarning` на `<html>`).
- Анимация переключения: новая тема разливается кругом от кнопки (View Transitions API + clip-path), fallback без анимации.
- Цвет WebGL-тумана и оверлеев берётся из текущей темы.

---

## 5. Supabase: схема

```sql
categories              (id, slug, sort_order)
category_translations   (category_id, locale, name)

projects (
  id, slug, category_id,
  year, client, role,
  stack text[],                 -- ['Next.js','Supabase','GSAP']
  live_url, repo_url,
  cover_url, cover_video_url,
  lighthouse_score int,
  is_featured bool, is_published bool,
  sort_order, created_at, updated_at
)
project_translations (
  project_id, locale,
  title, subtitle, summary,
  challenge, solution, result,  -- rich text (JSON Tiptap или markdown)
  seo_title, seo_description,
  is_auto bool,
  primary key (project_id, locale)
)
project_media (id, project_id, type /* image|video|before_after */, url, url_after, layout /* full|half|third */, sort_order)
media_translations (media_id, locale, caption)

technologies   (id, name, icon_url, url, sort_order)
clients        (id, name, logo_url, url, project_id, sort_order)
testimonials   (id, author, company, avatar_url, sort_order)
testimonial_translations (testimonial_id, locale, position, text)
timeline       (id, year, sort_order)
timeline_translations (timeline_id, locale, title, description)
services       (id, slug, icon, sort_order)
service_translations (service_id, locale, title, description)
site_settings  (key, value jsonb)               -- общие настройки: соцсети, email, цифры
site_settings_translations (key, locale, value jsonb)  -- тексты hero, about, CTA
leads          (id, name, email, type, budget, timeline, message, locale, created_at, is_read)
```

**RLS:**
- `select` для anon: только `is_published = true` и их переводы.
- `insert/update/delete`: только админ (свой `auth.uid()` в таблице `admins` или custom claim).
- `leads`: insert для anon (с rate limit и honeypot, или Turnstile), select только админ.

**Storage:** bucket `portfolio`, публичное чтение, запись только админ. Папки `projects/{slug}/`, `clients/`, `tech/`, `avatars/`, `cv/`.

Схема, типы и RLS-политики описываются в Drizzle (`lib/db/schema.ts`), миграции генерирует `drizzle-kit` в `drizzle/`.

---

## 6. Админка `/admin`

- Вход через Supabase Auth (magic link), регистрации нет, доступ только у владельца.
- CRUD проектов, медиа, услуг, технологий, клиентов, отзывов, таймлайна, настроек.
- Drag & drop сортировка (`dnd-kit`).
- Загрузка медиа: drag & drop, сжатие и конвертация в WebP/AVIF на клиенте перед загрузкой.
- Rich-text редактор (Tiptap).
- Вкладки языков у каждой сущности, индикатор заполненности переводов, кнопка автоперевода.
- Предпросмотр черновиков (Next.js Draft Mode).
- Список заявок (leads).
- После сохранения вызываются `revalidateTag` / `revalidatePath`: сайт статический, но обновляется сразу.

---

## 7. Стек

- **Next.js 16** (App Router, Cache Components, RSC, Server Actions), **TypeScript** strict
- **Tailwind CSS v4**, CSS-переменные
- **next-intl**, **next-themes**
- **Motion** (`motion/react`): UI, layout-анимации, AnimatePresence
- **GSAP + ScrollTrigger + SplitText**: скролл-сцены
- **Lenis**: плавный скролл (синхронизирован с ScrollTrigger)
- **React Three Fiber + drei** (или OGL для лёгкого тумана): WebGL
- **Howler.js**: звуки
- **Supabase** (`@supabase/ssr`): БД, Auth, Storage
- **Claude API** (`@anthropic-ai/sdk`): автоперевод
- **Nodemailer + Gmail SMTP**: email-уведомления о заявках
- **React Hook Form + Zod**: формы
- **Vercel**: деплой

---

## 8. Производительность и доступность

- Lighthouse 90+ на мобиле; статическая генерация всех локалей (`generateStaticParams`).
- WebGL, 3D и видео подгружаются лениво; на слабых устройствах и мобиле туман упрощается (меньше разрешение и итераций).
- `prefers-reduced-motion`: отключаются Lenis, тяжёлые скролл-сцены и туман, остаются мягкие fade.
- Мобила: горизонтальный скролл становится вертикальным, курсор и магниты отключаются.
- Доступность: фокус-стили, `aria` для меню, skip-link, контраст в обеих темах, звук выключен по умолчанию.

---

## 9. Структура проекта

```
app/
  [locale]/
    layout.tsx            ← провайдеры: intl, theme, Lenis, WebGL-фон, курсор
    page.tsx
    work/page.tsx
    work/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx
    lab/page.tsx
    not-found.tsx         ← интерактивная 404
  admin/...
  api/...
i18n/                     ← routing.ts, navigation.ts, request.ts
messages/                 ← en.json, ru.json, ...
proxy.ts                  ← next-intl + обновление сессии Supabase для /admin
components/
  motion/                 ← Reveal, SplitText, Parallax, Magnetic, Marquee, Cursor, PageTransition
  sections/               ← Hero, Showreel, Orbit, FeaturedWork, Services, Stack, Process, Stats, Testimonials, CTA
  webgl/                  ← MistBackground, shaders/
  ui/                     ← Button, ThemeToggle, LocaleSwitcher, Menu
lib/
  supabase/               ← client.ts, server.ts, proxy.ts (Auth, Storage)
  db/                     ← index.ts (Drizzle), schema.ts, queries.ts
  animations/             ← easings, presets
drizzle/                  ← SQL-миграции (drizzle-kit)
```

---

## 10. Этапы

1. **Каркас:** create-next-app, Tailwind, next-intl (все 15 локалей и middleware), next-themes, Supabase-клиенты, `.env.example`, деплой на Vercel.
2. **Дизайн-система:** токены цветов для двух тем, типографика, сетка, базовые motion-компоненты, Lenis.
3. **WebGL-туман** как фон всего сайта.
4. **Главная:** preloader, hero, showreel, orbit, featured work и остальные секции (сначала на моковых данных).
5. **БД:** миграции Supabase, RLS, сиды, подключение реальных данных.
6. **Работы и кейс** с shared-element переходами.
7. **Меню, переходы страниц, звуки, 404.**
8. **Админка** с автопереводом.
9. **Квиз и контакты**, письма через Gmail.
10. **Полировка:** мобила, reduced-motion, SEO, производительность.

## Открытые вопросы
- Настроение и палитра: тёмный драматичный, светлый галерейный или brutalist? Акцентный цвет?
- Сколько готовых проектов и есть ли записи экрана для showreel?
- Домен?
