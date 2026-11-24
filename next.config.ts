import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/*
 * Заголовки безопасности.
 * CSP: сайт статический, Next встраивает в HTML инлайн-скрипты загрузки, а nonce
 * сделал бы каждую страницу динамической. Поэтому скрипты 'self' + 'unsafe-inline',
 * а остальное закрыто: только свои источники, без фреймов, плагинов и чужих форм.
 * Админка (Sanity Studio) ходит в API Sanity, ей нужна своя политика.
 */
const isDev = process.env.NODE_ENV !== "production";

const csp = (directives: Record<string, string[]>) =>
  Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");

const siteCsp = csp({
  "default-src": ["'self'"],
  // eval нужен только dev-серверу (React Refresh)
  "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https://cdn.sanity.io"],
  "media-src": ["'self'", "blob:", "https://cdn.sanity.io"],
  "font-src": ["'self'"],
  "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
  "worker-src": ["'self'", "blob:"],
  "frame-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'", "mailto:"],
  ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
});

const studioCsp = csp({
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  // Аватары пользователей Sanity приходят с разных доменов (Google, GitHub)
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "blob:", "https://cdn.sanity.io"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'", "https://*.sanity.io", "wss://*.sanity.io", ...(isDev ? ["ws:"] : [])],
  "worker-src": ["'self'", "blob:"],
  "frame-src": ["'self'", "https://*.sanity.io"],
  "frame-ancestors": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
});

const common = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...common, { key: "X-Frame-Options", value: "DENY" }, { key: "Content-Security-Policy", value: siteCsp }],
      },
      {
        // Перекрывает политику выше для Studio (последнее совпадение побеждает)
        source: "/admin/:path*",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: studioCsp }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "Content-Security-Policy", value: studioCsp }],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Генерирует messages/en.d.json.ts: типобезопасные аргументы в сообщениях
    createMessagesDeclaration: "./messages/en.json",
  },
});

export default withNextIntl(nextConfig);
