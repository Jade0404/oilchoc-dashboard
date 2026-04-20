"use client";

import { useLang } from "./LanguageProvider";
import { useTranslations } from "@/lib/translations";

export default function Header() {
  const { lang, toggle } = useLang();
  const tr = useTranslations(lang);

  return (
    <header className="border-b border-zinc-800 px-6 py-8 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-4">
          {/* Left: title block */}
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-500">
              {tr("eyebrow")}
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {tr("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              {tr("subtitle")}
            </p>
          </div>

          {/* Right: lang toggle + Thailand badge */}
          <div className="flex shrink-0 flex-col items-end gap-3">
            <button
              onClick={toggle}
              className="rounded border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              {tr("toggleLang")}
            </button>
            <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-right">
              <p className="text-xs font-semibold text-amber-400">
                {tr("caseStudy")}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">{tr("thaiShocks")}</p>
              <p className="text-xs text-zinc-500">{tr("thaiPercentile")}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
