import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админка · Sergey Belyakov",
  robots: { index: false, follow: false },
};

/** Отдельный корневой layout: админка живёт вне локалей и без стилей сайта */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
