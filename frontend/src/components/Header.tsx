"use client";

import { useLang } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";
import { useTranslations } from "@/lib/translations";

export default function Header() {
  const { lang, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
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

          {/* Right: theme + lang toggle + Thailand badge */}
          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="rounded border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {theme === "dark" ? (
                  <svg className="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 4.22a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415L4.22 5.636a1 1 0 010-1.414zm11.313 0a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.415-1.415l1.414-1.414a1 1 0 011.415 0zM10 7a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 100 2 1 1 0 000-2zm5.657-5.657a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.415-1.415l1.414-1.414a1 1 0 011.415 0zM5.036 15.036a1 1 0 010 1.414l-1.414 1.414a1 1 0 11-1.415-1.415l1.414-1.414a1 1 0 011.415 0zM5 10a1 1 0 100 2H3a1 1 0 100-2h2zm7 0a1 1 0 100 2h2a1 1 0 100-2h-2zm-7 7a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM17 11a1 1 0 100-2h2a1 1 0 100 2h-2z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={toggle}
                className="rounded border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
              >
                {tr("toggleLang")}
              </button>
            </div>
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
