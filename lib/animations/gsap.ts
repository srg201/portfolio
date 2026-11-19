"use client";

/**
 * Единая точка импорта GSAP: плагины регистрируются один раз.
 * Импортируйте gsap отсюда, а не из "gsap" напрямую.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin);

export { gsap, ScrambleTextPlugin, ScrollTrigger, SplitText, useGSAP };
