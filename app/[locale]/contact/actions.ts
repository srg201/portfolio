"use server";

import { getTranslations } from "next-intl/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { renderLeadEmail } from "@/lib/lead-email";
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

/** Gmail для отправки: без адреса и пароля приложения форма не отправляется */
function gmail() {
  const user = process.env.GMAIL_USER_NAME;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  // Google показывает пароль приложения группами через пробел: убираем пробелы
  return { user, pass: pass.replace(/\s+/g, ""), to: process.env.LEADS_EMAIL || user };
}

/**
 * Заявка из квиза. Проверка zod, ловушки для ботов (скрытое поле company
 * и минимальное время заполнения), затем письмо владельцу через Gmail SMTP:
 * с его адреса на его же адрес, «Ответить» ведёт клиенту (reply-to).
 * Позже заявки будут ещё и сохраняться в Supabase (leads).
 */
export async function submitLead(_previous: LeadState, form: FormData): Promise<LeadState> {
  // Бот заполнил скрытое поле или отправил мгновенно: делаем вид, что всё хорошо
  const startedAt = Number(form.get("startedAt"));
  if (form.get("company") || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "sent" };
  }

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      status: "invalid",
      fields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))],
    };
  }

  const account = gmail();
  if (!account) return { status: "unavailable" };

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
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: account.user, pass: account.pass },
      // Без ответа SMTP форма не должна висеть минутами: через ~20 с покажем ошибку
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transport.sendMail({
      from: { name: "Портфолио", address: account.user },
      to: account.to,
      replyTo: { name: lead.name, address: lead.email },
      subject: `Заявка: ${t(`type.options.${lead.type}`)} · ${lead.name}`,
      text,
      html,
    });
    return { status: "sent" };
  } catch (error) {
    console.error("Lead email:", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}
