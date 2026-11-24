"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { renderLeadEmail } from "@/lib/lead-email";
import { MailError, mailEnabled, sendOwnerMail } from "@/lib/mail";
import {
  leadBudgets,
  leadTimelines,
  leadTypes,
  type LeadState,
} from "@/lib/lead-options";

/** Быстрее этого форму заполняет только бот, мс */
const MIN_FILL_MS = 3000;
/** Язык письма владельцу */
const OWNER_LOCALE = "ru";

const schema = z.object({
  type: z.enum(leadTypes),
  budget: z.enum(leadBudgets),
  timeline: z.enum(leadTimelines),
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  message: z.string().trim().max(4000).optional().default(""),
  locale: z.string().max(10),
});

/**
 * Заявка из квиза. Проверка zod, ловушки для ботов (скрытое поле hp_note
 * и минимальное время заполнения), затем письмо владельцу (lib/mail.ts:
 * Gmail SMTP), «Ответить» ведёт клиенту (reply-to).
 * Позже заявки будут ещё и сохраняться в Supabase (leads).
 */
export async function submitLead(_previous: LeadState, form: FormData): Promise<LeadState> {
  // Бот заполнил скрытое поле или отправил мгновенно: делаем вид, что всё хорошо
  // (имя поля не должно совпадать с тем, что браузер заполняет сам: company, address...)
  const startedAt = Number(form.get("startedAt"));
  const elapsed = Date.now() - startedAt;
  if (form.get("hp_note") || !startedAt || elapsed < MIN_FILL_MS) {
    console.warn("Lead dropped as bot:", form.get("hp_note") ? "honeypot filled" : `filled in ${elapsed} ms`);
    return { status: "sent" };
  }

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      status: "invalid",
      fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))],
    };
  }

  if (!mailEnabled()) {
    console.error("Lead email: GMAIL_USER_NAME or GMAIL_APP_PASSWORD is not set");
    return { status: "unavailable" };
  }

  const lead = parsed.data;
  const t = await getTranslations({ locale: OWNER_LOCALE, namespace: "Contact" });
  const { html, text } = renderLeadEmail(
    {
      name: lead.name,
      email: lead.email,
      message: lead.message,
      locale: lead.locale,
      type: t(`type.options.${lead.type}`),
      budget: t(`budget.options.${lead.budget}`),
      timeline: t(`timeline.options.${lead.timeline}`),
    },
    {
      heading: "Новая заявка с сайта",
      type: t("type.question"),
      budget: t("budget.question"),
      timeline: t("timeline.question"),
      message: "Комментарий",
      noMessage: "Без комментария",
      reply: "Ответить",
      footer: "Портфолио · квиз на /contact",
    },
  );

  try {
    const sent = await sendOwnerMail({
      subject: `Заявка: ${t(`type.options.${lead.type}`)} · ${lead.name}`,
      html,
      text,
      replyTo: { name: lead.name, address: lead.email },
    });
    console.info("Lead email sent:", sent.id);
    return { status: "sent" };
  } catch (error) {
    // Код помогает понять причину: 535 (неверный пароль), ETIMEDOUT (закрыт порт)
    console.error(
      "Lead email failed:",
      error instanceof MailError ? `${error.code}: ${error.message}` : error,
    );
    return { status: "error" };
  }
}
