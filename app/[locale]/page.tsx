import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";

export default function HomePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Hero />
      <Stats />
    </main>
  );
}
