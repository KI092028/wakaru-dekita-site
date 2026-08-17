import { Cta } from "@/components/home/cta";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { ParentTrust } from "@/components/home/parent-trust";
import { Today } from "@/components/home/today";
import { UnitGrid } from "@/components/home/unit-grid";

export default function HomePage() {
  return (
    <main className="flex-1 bg-white">
      <Hero />
      <Today />
      <Features />
      <UnitGrid />
      <ParentTrust />
      <Cta />
    </main>
  );
}
