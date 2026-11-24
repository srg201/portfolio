import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectCategories = [
  { title: "Веб-приложение", value: "app" },
  { title: "Сайт", value: "website" },
  { title: "Лендинг", value: "landing" },
] as const;

const video = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: "file",
    group: "media",
    options: { accept: "video/mp4,video/webm" },
  });

/** Проект портфолио: карточки на главной, /work и страница кейса /work/{slug} */
export const project = defineType({
  name: "project",
  title: "Проект",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "case", title: "Кейс" },
    { name: "media", title: "Медиа" },
    { name: "display", title: "Показ" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      group: "main",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "Адрес страницы",
      description: "Часть ссылки: /work/{адрес}. Латиница, цифры и дефисы",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Коротко",
      description: "Одна-две фразы для карточки и описания страницы",
      type: "localeText",
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Тип",
      description: "По нему фильтруются работы на /work",
      type: "string",
      group: "main",
      options: { list: [...projectCategories], layout: "radio", direction: "horizontal" },
      initialValue: "app",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Год",
      type: "number",
      group: "main",
      initialValue: () => new Date().getFullYear(),
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "client",
      title: "Клиент",
      description: "Пусто: личный проект",
      type: "string",
      group: "main",
    }),
    defineField({
      name: "role",
      title: "Роль",
      type: "localeString",
      group: "case",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stack",
      title: "Стек",
      type: "array",
      group: "case",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "highlights",
      title: "Что сделано",
      description: "Пункты списка на странице кейса",
      type: "array",
      group: "case",
      of: [defineArrayMember({ type: "localeText" })],
    }),
    defineField({
      name: "liveUrl",
      title: "Сайт",
      type: "url",
      group: "case",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "repoUrl",
      title: "Код (GitHub)",
      type: "url",
      group: "case",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "cover",
      title: "Обложка",
      description: "Скриншот первого экрана 16:10, не меньше 1600 px в ширину",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    video("preview", "Превью-видео", "Короткий беззвучный ролик для наведения на карточку"),
    video("caseVideo", "Видео кейса (десктоп)", "Запись прокрутки сайта на десктопе"),
    video("caseMobileVideo", "Видео кейса (телефон)", "Запись на телефоне, если сайт адаптивный"),
    defineField({
      name: "published",
      title: "Показывать на сайте",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Избранный",
      description: "Попадает в секцию работ на главной. Первый избранный: большая карточка",
      type: "boolean",
      group: "display",
      initialValue: false,
    }),
    defineField({
      name: "inCarousel",
      title: "В карусели на первом экране",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Порядок",
      description: "Меньше: выше в списках",
      type: "number",
      group: "display",
      initialValue: 100,
    }),
  ],
  orderings: [
    { title: "Порядок на сайте", name: "order", by: [{ field: "order", direction: "asc" }] },
    { title: "Сначала новые", name: "year", by: [{ field: "year", direction: "desc" }] },
  ],
  preview: {
    select: {
      title: "title",
      year: "year",
      category: "category",
      media: "cover",
      published: "published",
      featured: "featured",
    },
    prepare: ({ title, year, category, media, published, featured }) => ({
      title: `${featured ? "★ " : ""}${title}`,
      subtitle: [
        year,
        projectCategories.find((item) => item.value === category)?.title,
        published === false ? "скрыт" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
