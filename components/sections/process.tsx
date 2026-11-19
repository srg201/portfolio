import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ProcessMotion } from "./process-motion";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";
const steps = ["brief", "design", "build", "launch", "support"] as const;

/**
 * Процесс работы: шаги на линии, которая рисуется при скролле
 * (process-motion.tsx). На больших экранах заголовок закреплён слева.
 * Разметка по умолчанию в финальном состоянии: линия нарисована, узлы горят;
 * так выглядит секция без JS и с prefers-reduced-motion.
 */
export async function Process() {
  const t = await getTranslations("Process");

  return (
    <section
      aria-labelledby="process-title"
      className="px-4 py-24 min-[400px]:px-5 sm:px-6 md:px-10 md:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
        <header className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <p aria-hidden className={cn(meta, "text-brand")}>
            ( {t("label")} )
          </p>
          <h2
            id="process-title"
            className="text-5xl leading-[0.9] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl"
          >
            {t("title")}
          </h2>
          <p className="max-w-md text-base text-pretty text-muted-foreground sm:text-lg">
            {t("intro")}
          </p>
        </header>

        <ProcessMotion>
          <ol className="flex flex-col">
            {steps.map((step, index) => {
              const last = index === steps.length - 1;
              return (
                <li
                  key={step}
                  data-process-step
                  data-active
                  className="group/step relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-5 pb-14 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-8 sm:pb-20"
                >
                  {/* Отрезок линии от этого узла до следующего */}
                  {!last && (
                    <span
                      aria-hidden
                      className="absolute start-5 top-5 h-full w-px bg-border ltr:-translate-x-1/2 rtl:translate-x-1/2 sm:start-6 sm:top-6"
                    >
                      <span
                        data-process-line
                        className="block size-full origin-top bg-brand"
                      />
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      meta,
                      "relative grid size-10 place-items-center rounded-full border bg-background text-muted-foreground tabular-nums transition-[background-color,border-color,color,scale] duration-500 group-data-active/step:scale-110 group-data-active/step:border-primary group-data-active/step:bg-primary group-data-active/step:text-primary-foreground sm:size-12",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div
                    data-process-text
                    className="flex flex-col gap-3 pt-1.5 sm:pt-2"
                  >
                    <h3 className="text-2xl leading-tight font-semibold tracking-[-0.03em] text-muted-foreground transition-colors duration-500 group-data-active/step:text-foreground sm:text-4xl">
                      {t(`steps.${step}.title`)}
                    </h3>
                    <p className="max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
                      {t(`steps.${step}.description`)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </ProcessMotion>
      </div>
    </section>
  );
}
