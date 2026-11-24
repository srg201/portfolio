import "server-only";

export type LeadEmailData = {
  name: string;
  email: string;
  message: string;
  locale: string;
  /** Уже переведённые ответы квиза */
  type: string;
  budget: string;
  timeline: string;
};

export type LeadEmailLabels = {
  heading: string;
  type: string;
  budget: string;
  timeline: string;
  message: string;
  noMessage: string;
  reply: string;
  footer: string;
};

/*
 * Цвета: hex-приближения токенов светлой темы сайта (globals.css).
 * Почтовые клиенты не понимают CSS-переменные и oklch.
 */
const color = {
  page: "#f3efea",
  card: "#ffffff",
  text: "#1c1512",
  muted: "#7a6f68",
  line: "#e7e0d9",
  brand: "#e2551f",
  chip: "#faf1ea",
};

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const font =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const mono = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

/**
 * Письмо владельцу о новой заявке из квиза. Табличная вёрстка и инлайн-стили:
 * так письмо одинаково выглядит в Gmail, Apple Mail и Outlook.
 * Все данные из формы экранируются. Есть текстовая версия.
 */
export function renderLeadEmail(lead: LeadEmailData, labels: LeadEmailLabels) {
  const rows: [string, string][] = [
    [labels.type, lead.type],
    [labels.budget, lead.budget],
    [labels.timeline, lead.timeline],
  ];
  const message = lead.message.trim();
  const replyHref = `mailto:${encodeURIComponent(lead.email)}`;

  const details = rows
    .map(
      ([label, value], index) => `
        <tr>
          <td style="padding:14px 0;${index ? `border-top:1px solid ${color.line};` : ""}font-family:${mono};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${color.muted}" valign="top">${escape(label)}</td>
          <td style="padding:14px 0;${index ? `border-top:1px solid ${color.line};` : ""}font-family:${font};font-size:16px;color:${color.text}" align="right" valign="top">${escape(value)}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(labels.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${color.page}">
<div style="display:none;max-height:0;overflow:hidden">${escape(`${lead.name}: ${lead.type}, ${lead.budget}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.page}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${color.card};border-radius:24px;overflow:hidden">
    <tr><td style="height:6px;background:${color.brand}"></td></tr>
    <tr><td style="padding:32px 32px 8px">
      <div style="font-family:${mono};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${color.brand}">● ${escape(labels.heading)}</div>
      <div style="font-family:${font};font-size:34px;line-height:1.1;letter-spacing:-1px;color:${color.text};margin-top:14px">${escape(lead.name)}</div>
      <a href="${replyHref}" style="font-family:${font};font-size:16px;color:${color.muted};text-decoration:none">${escape(lead.email)}</a>
    </td></tr>
    <tr><td style="padding:20px 32px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.chip};border-radius:16px;padding:4px 18px">${details}</table>
    </td></tr>
    <tr><td style="padding:24px 32px 0">
      <div style="font-family:${mono};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${color.muted}">${escape(labels.message)}</div>
      <div style="font-family:${font};font-size:16px;line-height:1.6;color:${message ? color.text : color.muted};margin-top:8px;padding:16px 18px;border-left:3px solid ${color.brand};background:${color.page};border-radius:0 12px 12px 0;white-space:pre-wrap">${escape(message || labels.noMessage)}</div>
    </td></tr>
    <tr><td style="padding:28px 32px 32px">
      <a href="${replyHref}" style="display:inline-block;background:${color.brand};color:#ffffff;font-family:${mono};font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:16px 26px;border-radius:999px">${escape(labels.reply)} →</a>
    </td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid ${color.line};font-family:${mono};font-size:11px;letter-spacing:1px;color:${color.muted}">${escape(labels.footer)} · ${escape(lead.locale.toUpperCase())}</td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    labels.heading,
    "",
    `${lead.name} <${lead.email}>`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `${labels.message}:`,
    message || labels.noMessage,
    "",
    `${labels.footer} · ${lead.locale.toUpperCase()}`,
  ].join("\n");

  return { html, text };
}
