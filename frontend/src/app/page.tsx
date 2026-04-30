import Header from "@/components/Header";
import KeyFindings from "@/components/KeyFindings";
import ClientTools from "@/components/ClientTools";
import EvidenceSection from "@/components/Evidence/EvidenceSection";
import SimulationSection from "@/components/Evidence/SimulationSection";
import ReformRoadmapSection from "@/components/ReformRoadmap/ReformRoadmapSection";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <KeyFindings />
      <EvidenceSection />
      <SimulationSection />
      <ReformRoadmapSection />
      <ClientTools />
      <footer className="border-t border-zinc-800 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-zinc-400">World Bank GFP DB</span>
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-zinc-400">WB Subsidies DB</span>
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-zinc-400">NESDC SES 2023</span>
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-zinc-400">DOEB 2017</span>
          </div>
          <span>
            Mann-Whitney U p=0.0013 · KS p=0.0001 · Bootstrap CI [1.47×, 2.33×] · DiD +3.23pp · Gini=0.417 · Poverty 4.89%
          </span>
        </div>
      </footer>
    </main>
  );
}
