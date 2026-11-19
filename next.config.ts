import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
