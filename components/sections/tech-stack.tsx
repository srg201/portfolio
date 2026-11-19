import { getTranslations } from "next-intl/server";
import { marqueeRows, stack, type StackCategory } from "@/lib/mock/stack";
import { cn } from "@/lib/utils";
import { TechStackMarquee } from "./tech-stack-marquee";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Стек: бегущие строки для настроения и список по категориям с теми же
 * данными (строки aria-hidden, скринридер читает список).
 */
export async function TechStack() {
  const t = await getTranslations("Stack");
  const categories = Object.entries(stack) as [StackCategory, string[]][];

  return (
    <section aria-labelledby="stack-title" className="py-24 md:py-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 min-[400px]:px-5 sm:px-6 md:gap-16 md:px-10">
        <header className="grid gap-6 md:grid-cols-2 md:items-end">
          <div className="flex flex-col gap-6">
            <p aria-hidden className={cn(meta, "text-brand")}>
              ( {t("label")} )
            </p>
            <h2
              id="stack-title"
              className="text-5xl leading-[0.9] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-md text-base text-pretty text-muted-foreground sm:text-lg md:justify-self-end">
            {t("intro")}
          </p>
        </header>
      </div>

      <div className="my-12 md:my-16">
        <TechStackMarquee
          rows={marqueeRows}
          pauseLabel={t("pause")}
          playLabel={t("play")}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 min-[400px]:px-5 sm:px-6 md:px-10">
        <dl className="grid gap-x-10 gap-y-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([category, items]) => (
            <div key={category} className="flex flex-col gap-4">
              <dt className={cn(meta, "text-brand")}>
                {t(`categories.${category}`)}
              </dt>
              <dd>
                <ul className="flex flex-col gap-1.5 text-lg">
                  {items.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
