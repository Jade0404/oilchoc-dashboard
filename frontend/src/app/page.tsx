import Header from "@/components/Header";
import KeyFindings from "@/components/KeyFindings";
import ClientTools from "@/components/ClientTools";
import EvidenceSection from "@/components/Evidence/EvidenceSection";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <KeyFindings />
      <EvidenceSection />
      <ClientTools />
      <footer className="border-t border-zinc-800 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
          <span>
            World Bank Global Fuel Prices Database · NESDC (สศช.) ·
            DOEB (กรมธุรกิจพลังงาน) · Dec 2015 – Apr 2025
          </span>
          <span>
            Mann-Whitney U p=0.0014 · KS p=0.0001 · Bootstrap CI [1.47×, 2.33×]
          </span>
        </div>
      </footer>
    </main>
  );
}
