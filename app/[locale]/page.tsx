import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <>
      {/* relative: на мобиле панель языков растягивается по ширине шапки */}
      <header className="relative flex items-center justify-between gap-3 px-4 py-4 min-[400px]:px-5 sm:px-6 md:px-10 md:py-6">
        <span className="truncate font-medium">{t("Common.name")}</span>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <main
        id="main"
        className="flex flex-1 flex-col justify-center px-4 pb-24 min-[400px]:px-5 sm:px-6 md:px-10"
      >
        <p className="text-xs tracking-widest text-brand uppercase sm:text-sm">
          {t("Common.role")}
        </p>
        {/* Размер плавно растёт с шириной экрана, без скачков на брейкпоинтах */}
        <h1 className="mt-4 max-w-4xl text-[clamp(2.75rem,10vw+0.5rem,8rem)] leading-[0.95] font-semibold tracking-tight text-balance">
          {t("Common.name")}
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("Home.tagline")}
        </p>
      </main>
    </>
  );
}
