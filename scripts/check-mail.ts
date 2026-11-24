/**
 * Проверка почты для заявок: `pnpm mail:check`.
 * Подключается к Gmail с ключами из .env.local, проверяет вход
 * и отправляет тестовое письмо на адрес заявок. Пароль не печатает.
 */
import nodemailer from "nodemailer";

const user = process.env.GMAIL_USER_NAME?.trim();
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
const to = process.env.LEADS_EMAIL?.trim() || user;

if (!user || !pass) {
  console.error("✕ В .env.local не заданы GMAIL_USER_NAME и/или GMAIL_APP_PASSWORD");
  process.exit(1);
}
console.log(`Ящик: ${user}, пароль приложения: ${pass.length} символов (должно быть 16)`);

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

async function main() {
  try {
    await transport.verify();
    console.log("✓ Вход в Gmail успешен");
    const info = await transport.sendMail({
      from: { name: "Портфолио", address: user },
      to,
      subject: "Проверка почты для заявок",
      text: "Если вы видите это письмо, заявки с сайта будут приходить сюда.",
    });
    console.log(`✓ Письмо отправлено на ${to} (${info.messageId})`);
    console.log("  Не видно во «Входящих»? Посмотрите «Отправленные», «Все письма» и «Спам».");
  } catch (error) {
    const smtp = error as { code?: string; responseCode?: number; message?: string };
    console.error(`✕ ${smtp.code ?? ""} ${smtp.responseCode ?? ""} ${smtp.message ?? error}`);
    if (smtp.responseCode === 535 || smtp.code === "EAUTH") {
      console.error(
        "  Gmail не принял логин или пароль. Нужен именно пароль приложения (не обычный пароль),\n" +
          "  при включённой двухэтапной проверке: https://myaccount.google.com/apppasswords",
      );
    } else if (smtp.code === "ETIMEDOUT" || smtp.code === "ESOCKET") {
      console.error("  Нет связи с smtp.gmail.com: проверьте сеть, VPN или файрвол (порт 465).");
    }
    process.exit(1);
  }
}

void main();
