"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/*
 * next-themes вставляет inline-<script>, который ставит класс темы до гидрации.
 * На сервере он обычный скрипт. На клиенте (например, при смене языка layout
 * перерисовывается) React ругается на <script> в компоненте, поэтому там
 * помечаем его как data-блок: он инертен, а его работа уже сделана при SSR.
 * Расхождение атрибута type при гидрации глушит suppressHydrationWarning,
 * который next-themes ставит на скрипт сам.
 */
const scriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

export function Providers({
  children,
  direction,
}: {
  children: ReactNode;
  /** Направление текста для компонентов shadcn/Base UI (меню, слайдеры и т.п.) */
  direction: "ltr" | "rtl";
}) {
  return (
    <DirectionProvider direction={direction}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        scriptProps={scriptProps}
      >
        <SmoothScroll />
        {children}
      </ThemeProvider>
    </DirectionProvider>
  );
}
