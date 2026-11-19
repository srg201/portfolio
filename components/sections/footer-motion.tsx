"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/animations/gsap";
import { ease } from "@/lib/animations/easings";

/**
 * Футер выезжает шторкой: содержимое отстаёт от скролла и догоняет к концу
 * страницы. Заголовок поднимается по словам, подписи проявляются.
 * prefers-reduced-motion: статичный футер.
 */
export function FooterMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const inner = ref.current;
      const footer = inner?.closest("footer");
      if (!inner || !footer) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          inner,
          { yPercent: -18 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );

        const reveals = inner.querySelectorAll("[data-footer-reveal]");
        gsap.from(reveals, {
          autoAlpha: 0,
          y: 24,
          duration: 1,
          ease: ease.out,
          stagger: 0.1,
          scrollTrigger: { trigger: footer, start: "top 60%", once: true },
        });

        const title = inner.querySelector<HTMLElement>("[data-footer-title]");
        let split: SplitText | undefined;
        if (title) {
          split = SplitText.create(title, { type: "words", mask: "words" });
          gsap.from(split.words, {
            yPercent: 110,
            duration: 1.2,
            ease: ease.out,
            stagger: 0.06,
            scrollTrigger: { trigger: footer, start: "top 60%", once: true },
            onComplete: () => split?.revert(),
          });
        }

        return () => split?.revert();
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
