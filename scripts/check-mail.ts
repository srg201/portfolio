/**
 * Проверка почты для заявок: `pnpm mail:check`.
 * Отправляет тестовое письмо тем же способом, что и квиз (lib/mail.ts):
 * через Resend, если задан RESEND_API_KEY, иначе через Gmail SMTP.
 * Ключи и пароли не печатает.
 */
import { MailError, mailProvider, mailRecipient, sendOwnerMail } from "../lib/mail";

async function main() {
  const provider = mailProvider();
  if (!provider) {
    console.error(
      "✕ Почта не настроена: задайте в .env.local RESEND_API_KEY\n" +
        "  или GMAIL_USER_NAME и GMAIL_APP_PASSWORD",
    );
    process.exit(1);
  }
  console.log(`Способ: ${provider === "resend" ? "Resend (HTTPS)" : "Gmail SMTP"}, получатель: ${mailRecipient()}`);

  try {
    const sent = await sendOwnerMail({
      subject: "Проверка почты для заявок",
      text: "Если вы видите это письмо, заявки с сайта будут приходить сюда.",
    });
    console.log(`✓ Письмо отправлено (${sent.id})`);
    console.log("  Не видно во «Входящих»? Посмотрите «Все письма» и «Спам».");
  } catch (error) {
    const code = error instanceof MailError ? error.code : "";
    console.error(`✕ ${code} ${error instanceof Error ? error.message : error}`);
    if (code === "gmail-535" || code === "gmail-EAUTH") {
      console.error(
        "  Gmail не принял логин или пароль. Нужен пароль приложения (не обычный пароль)\n" +
          "  при включённой двухэтапной проверке: https://myaccount.google.com/apppasswords",
      );
    } else if (code === "gmail-ETIMEDOUT" || code === "gmail-ESOCKET") {
      console.error(
        "  Нет связи с smtp.gmail.com: почтовые порты закрыты (часто их режет VPN).\n" +
          "  Выход: RESEND_API_KEY в .env.local, Resend работает по HTTPS.",
      );
    } else if (code === "resend-401" || code === "resend-400") {
      console.error("  Resend не принял ключ: проверьте RESEND_API_KEY (начинается с re_).");
    } else if (code === "resend-403") {
      console.error(
        "  С отправителем onboarding@resend.dev можно писать только на адрес,\n" +
          "  с которым заведён аккаунт Resend. Укажите его в LEADS_EMAIL.",
      );
    }
    process.exit(1);
  }
}

void main();
