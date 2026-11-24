/**
 * Проверка почты для заявок: `pnpm mail:check`.
 * Отправляет тестовое письмо через Gmail SMTP тем же кодом, что и квиз
 * (lib/mail.ts). Пароль не печатает.
 */
import { MailError, mailEnabled, mailRecipient, sendOwnerMail } from "../lib/mail";

async function main() {
  if (!mailEnabled()) {
    console.error("✕ В .env.local не заданы GMAIL_USER_NAME и/или GMAIL_APP_PASSWORD");
    process.exit(1);
  }
  console.log(`Gmail SMTP, получатель: ${mailRecipient()}`);

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
    if (code === "535" || code === "EAUTH") {
      console.error(
        "  Gmail не принял логин или пароль. Нужен пароль приложения (не обычный пароль)\n" +
          "  при включённой двухэтапной проверке: https://myaccount.google.com/apppasswords",
      );
    } else if (code === "ETIMEDOUT" || code === "ESOCKET") {
      console.error(
        "  Нет связи с smtp.gmail.com: почтовые порты 465/587 закрыты (часто их режет VPN).",
      );
    }
    process.exit(1);
  }
}

void main();
