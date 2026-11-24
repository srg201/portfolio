"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead } from "@/app/[locale]/contact/actions";
import {
  leadBudgets,
  leadTimelines,
  leadTypes,
  type LeadState,
} from "@/lib/lead-options";
import { cn } from "@/lib/utils";

const meta = "font-mono text-[0.7rem] tracking-[0.14em] uppercase sm:text-xs";
const STEPS = ["type", "budget", "timeline", "details"] as const;
type Choice = "type" | "budget" | "timeline";

const OPTIONS = {
  type: leadTypes,
  budget: leadBudgets,
  timeline: leadTimelines,
} as const;

/**
 * Квиз «Расскажите о проекте»: тип, бюджет, сроки, контакты.
 * Одна форма на все шаги, ответы прошлых шагов лежат в скрытых полях.
 * - enabled: отправка серверным действием (письмо через Gmail);
 * - иначе, если есть публичный email: открываем письмо с ответами;
 * - иначе: сообщение и ссылки ниже (рисует страница).
 * Фокус после смены шага переходит на вопрос: скринридер его прочитает.
 */
export function Quiz({ enabled, email }: { enabled: boolean; email: string | null }) {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const id = useId();
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, {
    status: "idle",
  });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<Choice, string>>>({});
  const [error, setError] = useState<string | null>(null);
  // Контакты храним в состоянии: React сбрасывает форму после отправки,
  // а при ошибке человек не должен вводить всё заново
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const bind = (key: keyof typeof contact) => ({
    value: contact[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setContact((value) => ({ ...value, [key]: event.target.value })),
  });
  // Время начала для ловушки ботов: первый переход к следующему шагу.
  // В состоянии, а не в defaultValue: сброс формы после ошибки не должен его обнулять
  const [startedAt, setStartedAt] = useState(0);
  const heading = useRef<HTMLLegendElement>(null);
  const moved = useRef(false);

  const current = STEPS[step]!;

  // После смены шага фокус на вопрос (но не при первом показе страницы)
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
  }, [step]);

  const next = () => {
    if (current !== "details" && !answers[current]) {
      setError(t("errors.choice"));
      return;
    }
    setError(null);
    moved.current = true;
    const now = Date.now();
    setStartedAt((value) => value || now);
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  };
  const back = () => {
    setError(null);
    moved.current = true;
    setStep((value) => Math.max(value - 1, 0));
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-md border p-8 md:p-12">
        <span className="grid size-12 place-items-center rounded-full bg-success text-background">
          <Check aria-hidden className="size-6" />
        </span>
        <h2 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl">
          {t("success.title")}
        </h2>
        <p className="text-lg text-muted-foreground">{t("success.text")}</p>
      </div>
    );
  }

  const invalid = state.status === "invalid" ? state.fields : [];
  const serverMessage =
    state.status === "unavailable"
      ? t("unavailable")
      : state.status === "limited"
        ? t("errors.limited")
        : state.status === "error"
          ? t("errors.generic")
          : null;

  /** Без отправки: письмо с ответами в почтовом клиенте */
  const mailto = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const label = (key: Choice) =>
      answers[key] ? t(`${key}.options.${answers[key]}` as never) : "";
    const body = [
      `${t("type.question")} ${label("type")}`,
      `${t("budget.question")} ${label("budget")}`,
      `${t("timeline.question")} ${label("timeline")}`,
      "",
      String(data.get("message") ?? ""),
      "",
      `${data.get("name") ?? ""} <${data.get("email") ?? ""}>`,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(t("title"))}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      action={action}
      noValidate={false}
      onSubmit={(event) => {
        if (current !== "details") {
          event.preventDefault();
          next();
          return;
        }
        if (!enabled) {
          event.preventDefault();
          if (email) mailto(event.currentTarget);
        }
      }}
      className="flex flex-col gap-8"
    >
      {/* Прогресс */}
      <div className="flex flex-col gap-3">
        <p className={cn(meta, "text-muted-foreground")} aria-live="polite">
          {t("step", { current: String(step + 1), total: String(STEPS.length) })}
        </p>
        <div aria-hidden className="h-px w-full bg-border">
          <div
            className="h-full origin-left bg-brand transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rtl:origin-right"
            style={{ scale: `${(step + 1) / STEPS.length} 1` }}
          />
        </div>
      </div>

      {/* Ответы прошлых шагов уходят с формой */}
      {(Object.keys(OPTIONS) as Choice[]).map((key) => (
        <input key={key} type="hidden" name={key} value={answers[key] ?? ""} />
      ))}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Ловушка для ботов: людям не видна и не фокусируется */}
      <input
        type="text"
        name="hp_note"
        data-1p-ignore
        data-lpignore="true"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -start-[9999px] size-px opacity-0"
      />

      {current !== "details" ? (
        <fieldset key={current} className="flex flex-col gap-6 motion-safe:animate-[quiz-in_600ms_cubic-bezier(0.16,1,0.3,1)]">
          <legend
            ref={heading}
            tabIndex={-1}
            className="mb-6 text-4xl leading-none font-light tracking-[-0.04em] outline-none sm:text-6xl"
          >
            {t(`${current}.question`)}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPTIONS[current].map((option) => {
              const checked = answers[current] === option;
              return (
                <label
                  key={option}
                  className={cn(
                    "group/option relative flex cursor-pointer items-center justify-between gap-4 rounded-md border p-5 text-lg transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                    checked
                      ? "border-foreground bg-foreground text-background"
                      : "hover:border-foreground/60 hover:bg-accent",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-${current}`}
                    value={option}
                    checked={checked}
                    onChange={() => {
                      setAnswers((value) => ({ ...value, [current]: option }));
                      setError(null);
                    }}
                    className="sr-only"
                  />
                  {t(`${current}.options.${option}` as never)}
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-6 place-items-center rounded-full border transition-colors",
                      checked ? "border-background bg-background text-foreground" : "",
                    )}
                  >
                    {checked && <Check className="size-3.5" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <fieldset className="flex flex-col gap-6 motion-safe:animate-[quiz-in_600ms_cubic-bezier(0.16,1,0.3,1)]">
          <legend
            ref={heading}
            tabIndex={-1}
            className="mb-6 text-4xl leading-none font-light tracking-[-0.04em] outline-none sm:text-6xl"
          >
            {t("details.question")}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={`${id}-name`}
              name="name"
              {...bind("name")}
              label={t("details.name")}
              autoComplete="name"
              required
              error={invalid.includes("name") ? t("errors.name") : undefined}
            />
            <Field
              id={`${id}-email`}
              name="email"
              type="email"
              {...bind("email")}
              label={t("details.email")}
              autoComplete="email"
              required
              error={invalid.includes("email") ? t("errors.email") : undefined}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-message`} className={cn(meta, "text-muted-foreground")}>
              {t("details.message")}
            </label>
            <textarea
              id={`${id}-message`}
              name="message"
              {...bind("message")}
              rows={4}
              maxLength={4000}
              placeholder={t("details.placeholder")}
              className="resize-y rounded-md border bg-background/40 px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        </fieldset>
      )}

      {(error || serverMessage) && (
        <p role="alert" className="text-sm text-destructive">
          {error ?? serverMessage}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className={cn(
            meta,
            "inline-flex h-12 items-center gap-2 rounded-full px-4 transition-opacity hover:bg-accent disabled:pointer-events-none disabled:opacity-0",
          )}
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            meta,
            "group/next inline-flex h-12 items-center gap-3 rounded-full bg-primary ps-6 pe-1.5 text-primary-foreground transition-[scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 disabled:opacity-60",
          )}
        >
          {current === "details" ? (pending ? t("sending") : t("submit")) : t("next")}
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-primary-foreground text-primary transition-transform duration-500 group-hover/next:translate-x-0.5 rtl:-scale-x-100"
          >
            <ArrowRight className="size-4" />
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={cn(meta, "text-muted-foreground")}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 rounded-md border bg-background/40 px-4 text-base outline-none transition-colors focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
