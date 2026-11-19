import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { getCareerStats } from "@/lib/career";
import { cn } from "@/lib/utils";
import { StatsMotion } from "./stats-motion";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";

/**
 * Цифры после шоурила. Секция-«карточка» наезжает на закреплённое
 * полноэкранное видео в конце сцены hero (отрицательный отступ сверху),
 * числа досчитывают до значения при появлении (stats-motion.tsx).
 * Без анимаций: обычный блок под видео, числа сразу финальные.
 */
export async function Stats() {
  const t = await getTranslations("Stats");
  const format = await getFormatter();
  const locale = await getLocale();
  const { days, years, startYear, projects } = await getCareerStats();

  const counters = [
    { value: projects, suffix: "+", label: t("projects") },
    { value: years, suffix: "+", label: t("years") },
  ];

  return (
    <section
      aria-labelledby="stats-title"
      className="relative z-20 -mt-[45svh] rounded-t-[2rem] border-t bg-background px-4 pt-16 pb-36 min-[400px]:px-5 sm:rounded-t-[3rem] sm:px-6 sm:pt-24 md:px-10 md:pt-32 motion-reduce:mt-0"
    >
      <StatsMotion locale={locale}>
        <div className="mx-auto flex max-w-7xl flex-col gap-16 md:gap-24">
          <p data-stats-reveal aria-hidden className={cn(meta, "text-brand")}>
            ( {t("label")} )
          </p>

          {/* Главное число: дни в коде */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
            <p className="flex flex-col gap-5">
              <span
                data-count={days}
                className="text-[clamp(4.5rem,19vw,16rem)] leading-none font-semibold tracking-[-0.05em] tabular-nums"
              >
                {format.number(days)}
              </span>
              <span
                data-stats-reveal
                className={cn(meta, "text-muted-foreground")}
              >
                {t("days")}
              </span>
            </p>

            <h2
              id="stats-title"
              data-stats-title
              className="max-w-xl text-2xl leading-tight font-medium text-balance sm:text-3xl md:pb-3 md:text-end lg:text-4xl"
            >
              {t("title", { year: String(startYear) })}
            </h2>
          </div>

          {/* Остальные счётчики */}
          <dl className="grid gap-x-10 gap-y-12 border-t pt-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr]">
            {counters.map((counter) => (
              <div key={counter.label} className="flex flex-col gap-3">
                <dt className={cn(meta, "order-2 text-muted-foreground")}>
                  {counter.label}
                </dt>
                <dd className="order-1 text-6xl leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-7xl">
                  {/* dir="ltr": в RTL «20+» не превращается в «+20» */}
                  <span
                    dir="ltr"
                    data-count={counter.value}
                    data-suffix={counter.suffix}
                  >
                    {`${format.number(counter.value)}${counter.suffix}`}
                  </span>
                </dd>
              </div>
            ))}
            <p
              data-stats-reveal
              className="max-w-sm text-base text-pretty text-muted-foreground sm:col-span-2 sm:text-lg lg:col-span-1 lg:self-end lg:justify-self-end"
            >
              {t("thanks")}
            </p>
          </dl>
        </div>
      </StatsMotion>
    </section>
  );
}
