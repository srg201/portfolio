import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Общие настройки сайта: один документ (синглтон) */
export const settings = defineType({
  name: "settings",
  title: "Настройки сайта",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "available",
      title: "Свободен для новых проектов",
      description: "Зелёная метка на первом экране",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "email",
      title: "Публичный email",
      description: "Показывается в футере и на странице контактов. Пусто: не показывать",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "socials",
      title: "Соцсети",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "social",
          fields: [
            defineField({ name: "name", title: "Название", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "url",
              title: "Ссылка",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "name", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "careerStart",
      title: "Начало карьеры",
      description: "От этой даты считаются годы опыта на странице «Обо мне»",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectsCount",
      title: "Запущено проектов",
      description: "Показывается как «20+»",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: { prepare: () => ({ title: "Настройки сайта" }) },
});
