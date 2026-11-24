import { defineType, type FieldDefinition, type Rule } from "sanity";
import { defaultLocale, localeNames, locales } from "@/i18n/locales";

/**
 * Поля с переводами: основной язык (английский) виден сразу и обязателен,
 * остальные 14 языков в свёрнутом блоке «Переводы». На сайте берётся
 * перевод для языка страницы, а если его нет, английский.
 */
function localized(name: string, title: string, type: "string" | "text") {
  return defineType({
    name,
    title,
    type: "object",
    fieldsets: [
      {
        name: "translations",
        title: "Переводы",
        description: "Пустой язык показывает английский текст",
        options: { collapsible: true, collapsed: true, columns: 1 },
      },
    ],
    fields: locales.map(
      (locale) =>
        ({
        name: locale,
        title: localeNames[locale],
        type,
        ...(type === "text" ? { rows: 3 } : {}),
        ...(locale === defaultLocale
          ? { validation: (rule: Rule) => rule.required().error("Английский текст обязателен") }
          : { fieldset: "translations" }),
        }) as FieldDefinition,
    ),
  });
}

export const localeString = localized("localeString", "Строка с переводами", "string");
export const localeText = localized("localeText", "Текст с переводами", "text");
