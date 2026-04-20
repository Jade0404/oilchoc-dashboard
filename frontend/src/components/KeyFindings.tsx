"use client";

import { useLang } from "./LanguageProvider";
import { useTranslations } from "@/lib/translations";

const stats = [
  { valueKey: "stat1Value", labelKey: "stat1Label" },
  { valueKey: "stat2Value", labelKey: "stat2Label" },
  { valueKey: "stat3Value", labelKey: "stat3Label" },
  { valueKey: "stat4Value", labelKey: "stat4Label" },
] as const;

export default function KeyFindings() {
  const { lang } = useLang();
  const tr = useTranslations(lang);

  return (
    <section className="border-b border-zinc-800 bg-[#0f0f0f] px-6 py-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {tr("findingsLabel")}
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ valueKey, labelKey }) => (
            <div key={valueKey} className="border-l-2 border-amber-500 pl-4">
              <p className="text-2xl font-bold text-white md:text-3xl">
                {tr(valueKey)}
              </p>
              <p className="mt-1 text-xs text-zinc-400 md:text-sm">
                {tr(labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
