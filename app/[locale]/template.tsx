import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/page-transition";

/** Монтируется заново при каждой навигации: анимация входа страницы */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
