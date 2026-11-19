import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Link } from "@/i18n/navigation";

/** Инициалы из имени: «Sergey Belyakov» → «SB» */
function initials(name: string) {
  return name
    .split(/[\s·・]+/)
    .filter(Boolean)
    .map((part) => [...part][0])
    .join("")
    .slice(0, 2);
}

/**
 * Плавающая плашка внизу экрана: домой, язык, тема (кнопка меню появится на этапе 7).
 * Заменяет шапку; на мобиле до неё удобно дотянуться большим пальцем.
 */
export async function Dock() {
  const t = await getTranslations("Dock");
  const common = await getTranslations("Common");
  const name = common("name");

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border bg-background/70 p-1.5 shadow-xl shadow-foreground/5 backdrop-blur-xl sm:inset-x-6 sm:bottom-5"
    >
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-full pe-1 sm:pe-3"
      >
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-full bg-foreground font-mono text-xs font-semibold text-background uppercase transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12"
        >
          {initials(name)}
        </span>
        <span className="sr-only text-sm font-medium sm:not-sr-only">
          {name}
        </span>
        <span className="sr-only">{t("home")}</span>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <LocaleSwitcher />
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
