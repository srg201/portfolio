import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Временная версия: интерактивная 404 появится на этапе 7
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center min-[400px]:px-6"
    >
      <p className="font-mono text-[clamp(4rem,20vw,7rem)] leading-none font-semibold text-brand">
        404
      </p>
      <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-4 h-11 rounded-full px-6")}
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
