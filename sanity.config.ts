"use client";

/**
 * Sanity Studio: админка контента на /admin (app/admin/[[...tool]]/page.tsx).
 * Вход через аккаунт Sanity: редактировать могут только участники проекта.
 */
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { visionTool } from "@sanity/vision";
import { buildLegacyTheme, defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

/** Документы-одиночки: их нельзя создать второй раз или удалить */
const SINGLETONS = new Set(["settings"]);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

/** Цвета студии в тон сайту: тёплый тёмный и фирменный оранжевый */
const theme = buildLegacyTheme({
  "--black": "#120d0b",
  "--white": "#f6f2ee",
  "--gray": "#8a7f78",
  "--gray-base": "#8a7f78",
  "--component-bg": "#1b1512",
  "--component-text-color": "#f6f2ee",
  "--brand-primary": "#e8622a",
  "--default-button-color": "#8a7f78",
  "--default-button-primary-color": "#e8622a",
  "--default-button-success-color": "#3fa66b",
  "--default-button-warning-color": "#e0a531",
  "--default-button-danger-color": "#e0484f",
  "--state-info-color": "#e8622a",
  "--state-success-color": "#3fa66b",
  "--state-warning-color": "#e0a531",
  "--state-danger-color": "#e0484f",
  "--main-navigation-color": "#120d0b",
  "--main-navigation-color--inverted": "#f6f2ee",
  "--focus-color": "#e8622a",
});

export default defineConfig({
  name: "portfolio",
  title: "Sergey Belyakov",
  basePath: "/admin",
  projectId,
  dataset,
  theme,
  schema: {
    types: schemaTypes,
    // «Создать новый» не предлагает документы-одиночки
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
    // Кнопка «Открыть на сайте» у проекта
    productionUrl: async (previous, { document }) => {
      const slug = (document.slug as { current?: string } | undefined)?.current;
      return document._type === "project" && slug && SITE_URL ? `${SITE_URL}/ru/work/${slug}` : previous;
    },
  },
  plugins: [
    structureTool({
      title: "Контент",
      structure: (S) =>
        S.list()
          .title("Контент")
          .items([
            S.listItem()
              .title("Настройки сайта")
              .icon(CogIcon)
              .child(S.document().schemaType("settings").documentId("settings").title("Настройки сайта")),
            S.divider(),
            S.listItem()
              .title("Проекты")
              .icon(CaseIcon)
              .child(
                S.documentTypeList("project")
                  .title("Проекты")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
          ]),
    }),
    // GROQ-песочница нужна только при разработке
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});
