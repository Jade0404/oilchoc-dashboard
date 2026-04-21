"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLang } from "@/components/LanguageProvider";
import { useTranslations } from "@/lib/translations";
import {
  fetchStatDefence,
  fetchCountryScatter,
  fetchPriceTimeline,
} from "@/lib/api";
import type { StatDefence, CountryScatterPoint, PriceTimeline } from "@/types";
import StatDefencePanel from "./StatDefencePanel";

const CountryScatterChart = dynamic(() => import("./CountryScatter"), { ssr: false });
const PriceTimelineChart  = dynamic(() => import("./PriceTimeline"),  { ssr: false });

type Tab = "proof" | "scatter" | "timeline";

export default function EvidenceSection() {
  const { lang } = useLang();
  const tr = useTranslations(lang);
  const [tab, setTab] = useState<Tab>("proof");

  const [defence,   setDefence]   = useState<StatDefence | null>(null);
  const [scatter,   setScatter]   = useState<CountryScatterPoint[] | null>(null);
  const [timeline,  setTimeline]  = useState<PriceTimeline | null>(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStatDefence(), fetchCountryScatter(), fetchPriceTimeline()])
      .then(([d, s, t]) => { setDefence(d); setScatter(s); setTimeline(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; labelTh: string }[] = [
    { key: "proof",    label: "Statistical Proof",    labelTh: "การพิสูจน์ทางสถิติ" },
    { key: "scatter",  label: "Country Comparison",   labelTh: "เปรียบเทียบประเทศ" },
    { key: "timeline", label: "Price Timeline",       labelTh: "ราคาตามเวลา" },
  ];

  return (
    <section className="border-b border-zinc-800 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-8 bg-teal-500" />
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
                {lang === "th" ? "หลักฐานเชิงประจักษ์" : "Empirical Evidence"}
              </p>
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              {lang === "th"
                ? "การพิสูจน์ว่าการควบคุมราคาสร้างระเบิดเวลา"
                : "The Time-Bomb: Statistical Proof"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              {lang === "th"
                ? `ข้อมูลจริงจาก ${scatter?.length ?? "207"} ประเทศ ช่วง ${tr("period")} — พิสูจน์ด้วย 4 วิธีทางสถิติ`
                : `Real data from ${scatter?.length ?? "207"} countries, ${tr("period")} — tested with 4 independent statistical methods`}
            </p>
          </div>

          {/* Source pills */}
          <div className="flex flex-wrap gap-2">
            {[
              "World Bank Fuel Prices DB",
              "NESDC / สศช.",
              "DOEB / กรมธุรกิจพลังงาน",
            ].map((src) => (
              <span
                key={src}
                className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-400"
              >
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded border border-zinc-800 bg-zinc-900 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                tab === t.key
                  ? "bg-teal-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang === "th" ? t.labelTh : t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-64">
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <div className="text-xs text-zinc-500 animate-pulse">
                {lang === "th" ? "กำลังคำนวณจากข้อมูลจริง..." : "Computing from real data..."}
              </div>
            </div>
          )}

          {!loading && tab === "proof" && defence && (
            <StatDefencePanel data={defence} />
          )}

          {!loading && tab === "scatter" && scatter && (
            <div>
              <p className="mb-4 text-sm text-zinc-400">
                {lang === "th"
                  ? "แกน X = ความผันผวนราคาปกติ, แกน Y = ความถี่ราคากระชาก — ตลาดควบคุมราคา (สีเหลือง) กระจุกตัวที่ด้านบนสูงกว่า"
                  : "X = normal price volatility, Y = shock frequency. Regulated markets (amber) cluster higher on Y — same volatility, more shocks."}
              </p>
              <CountryScatterChart data={scatter} lang={lang} />
            </div>
          )}

          {!loading && tab === "timeline" && timeline && (
            <div>
              <p className="mb-4 text-sm text-zinc-400">
                {lang === "th"
                  ? "ไทยและมาเลเซีย (ควบคุมราคา): ราคาแบนยาว → กระโดดทีเดียว vs เยอรมนี (ตลาดเสรี): ขึ้นลงต่อเนื่อง"
                  : "Thailand & Malaysia (regulated): long flat → sudden jump. Germany (deregulated): continuous adjustment — no pressure build-up."}
              </p>
              <PriceTimelineChart data={timeline} lang={lang} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
