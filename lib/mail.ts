/**
 * Отправка писем владельцу (заявки из квиза) через Gmail SMTP.
 * Только для сервера и скриптов.
 *
 * Переменные: GMAIL_USER_NAME (адрес Gmail) и GMAIL_APP_PASSWORD (пароль
 * приложения). Получатель: LEADS_EMAIL, если не задан, то GMAIL_USER_NAME.
 * Нужны открытые почтовые порты 465/587: на Vercel они открыты,
 * а локально их может закрывать VPN.
 */
import nodemailer from "nodemailer";

export type OwnerMail = {
  subject: string;
  html?: string;
  text: string;
  replyTo?: { name: string; address: string };
};

const env = (key: string) => process.env[key]?.trim() || undefined;

function config() {
  const user = env("GMAIL_USER_NAME");
  // Google показывает пароль приложения группами через пробел: убираем пробелы
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  return { user, pass, to: env("LEADS_EMAIL") ?? user };
}

/** Настроена ли отправка */
export function mailEnabled() {
  return config() !== null;
}

/** Куда уходят письма (для сообщений скрипта проверки) */
export function mailRecipient() {
  return config()?.to ?? null;
}

/** Отправляет письмо владельцу. Бросает MailError с кодом, если не вышло */
export async function sendOwnerMail(mail: OwnerMail): Promise<{ id: string }> {
  const settings = config();
  if (!settings) throw new MailError("not-configured", "Mail is not configured");

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
    return { id: info.messageId };
  } catch (error) {
    const smtp = error as { code?: string; responseCode?: number; message?: string };
    throw new MailError(String(smtp.responseCode ?? smtp.code ?? "error"), smtp.message ?? String(error));
  }
}

export class MailError extends Error {
  constructor(
    /** 535 (неверный пароль), EAUTH, ETIMEDOUT (закрыт порт), not-configured... */
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MailError";
  }
}
