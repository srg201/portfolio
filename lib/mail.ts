/**
 * Отправка писем владельцу (заявки из квиза). Только для сервера и скриптов.
 *
 * Два способа, выбираются по переменным окружения:
 * - Resend (HTTPS API), если задан RESEND_API_KEY. Работает через VPN и
 *   сети, где закрыты почтовые порты. С отправителем onboarding@resend.dev
 *   письма можно слать только на адрес, с которым заведён аккаунт Resend;
 * - иначе Gmail SMTP: GMAIL_USER_NAME и пароль приложения GMAIL_APP_PASSWORD.
 *
 * Получатель: LEADS_EMAIL, если не задан, то GMAIL_USER_NAME.
 */
import nodemailer from "nodemailer";

export type MailProvider = "resend" | "gmail";

export type OwnerMail = {
  subject: string;
  html?: string;
  text: string;
  replyTo?: { name: string; address: string };
};

const env = (key: string) => process.env[key]?.trim() || undefined;

function config() {
  const to = env("LEADS_EMAIL") ?? env("GMAIL_USER_NAME");
  const resendKey = env("RESEND_API_KEY");
  if (resendKey && to) {
    return {
      provider: "resend" as const,
      to,
      key: resendKey,
      from: env("RESEND_FROM") ?? "Портфолио <onboarding@resend.dev>",
    };
  }
  const user = env("GMAIL_USER_NAME");
  // Google показывает пароль приложения группами через пробел: убираем пробелы
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (user && pass && to) return { provider: "gmail" as const, to, user, pass };
  return null;
}

/** Какой способ отправки настроен (null: никакой) */
export function mailProvider(): MailProvider | null {
  return config()?.provider ?? null;
}

/** Куда уходят письма (для сообщений скрипта проверки) */
export function mailRecipient() {
  return config()?.to ?? null;
}

/** Отправляет письмо владельцу. Бросает ошибку с понятным текстом, если не вышло */
export async function sendOwnerMail(mail: OwnerMail): Promise<{ provider: MailProvider; id: string }> {
  const settings = config();
  if (!settings) throw new MailError("not-configured", "Mail is not configured");

  if (settings.provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: settings.from,
        to: [settings.to],
        reply_to: mail.replyTo
          ? `${mail.replyTo.name.replaceAll(/["<>]/g, "")} <${mail.replyTo.address}>`
          : undefined,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      throw new MailError(`resend-${response.status}`, body.message ?? response.statusText);
    }
    return { provider: "resend", id: body.id ?? "" };
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: settings.user, pass: settings.pass },
    // Без ответа SMTP форма не должна висеть минутами
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    const info = await transport.sendMail({
      from: { name: "Портфолио", address: settings.user },
      to: settings.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return { provider: "gmail", id: info.messageId };
  } catch (error) {
    const smtp = error as { code?: string; responseCode?: number; message?: string };
    throw new MailError(
      `gmail-${smtp.responseCode ?? smtp.code ?? "error"}`,
      smtp.message ?? String(error),
    );
  }
}

export class MailError extends Error {
  constructor(
    /** resend-403, gmail-535, gmail-ETIMEDOUT, not-configured... */
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MailError";
  }
}
