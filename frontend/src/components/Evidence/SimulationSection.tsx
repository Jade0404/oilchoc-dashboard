"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { useLang } from "@/components/LanguageProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SimTab = "causal" | "abm" | "optimize";

const CHART_STYLE = {
  grid: "#27272a",
  tick: "#71717a",
  tooltip: { background: "#242220", border: "1px solid #403c37", borderRadius: 6, fontSize: 11 },
  label: { fill: "#52525b", fontSize: 10 },
};

export default function SimulationSection() {
  const { lang } = useLang();
  const [tab, setTab] = useState<SimTab>("causal");
  const [causal, setCausal] = useState<any>(null);
  const [abm, setAbm] = useState<any>(null);
  const [opt, setOpt] = useState<any>(null);
  const [abmSubsidy, setAbmSubsidy] = useState(30);
  const [optPriority, setOptPriority] = useState<"balanced" | "equity" | "fiscal">("balanced");
  const [loading, setLoading] = useState(false);

  // Load causal on mount
  useEffect(() => {
    fetch(`${BASE_URL}/api/simulation/causal`)
      .then((r) => r.json())
      .then(setCausal)
      .catch(() => {});
  }, []);

  // Load ABM when subsidy changes
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/simulation/abm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subsidy_level_pct: abmSubsidy, n_months: 60 }),
    })
      .then((r) => r.json())
      .then(setAbm)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [abmSubsidy]);

  // Load optimizer when priority changes
  useEffect(() => {
    fetch(`${BASE_URL}/api/simulation/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_subsidy_pct: 30, priority: optPriority }),
    })
      .then((r) => r.json())
      .then(setOpt)
      .catch(() => {});
  }, [optPriority]);

  const tabs = [
    { key: "causal" as SimTab, en: "Causal Inference", th: "Causal Inference" },
    { key: "abm"    as SimTab, en: "Agent-Based Model", th: "Agent-Based Model" },
    { key: "optimize" as SimTab, en: "Optimization", th: "Optimization" },
  ];

  return (
    <section className="border-b border-zinc-800 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-8 bg-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
              {lang === "th" ? "การจำลองและการอนุมาน" : "Simulation & Inference"}
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {lang === "th" ? "Causal Inference · ABM · Optimization" : "Causal Inference · ABM · Optimization"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lang === "th"
              ? "พิสูจน์ความเป็นเหตุเป็นผล จำลองพฤติกรรมครัวเรือน และหาเส้นทางปฏิรูปที่ดีที่สุด"
              : "Establish causality, simulate household behaviour, find the optimal reform path."}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded border border-zinc-800 bg-zinc-900 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                tab === t.key ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {lang === "th" ? t.th : t.en}
            </button>
          ))}
        </div>

        {/* ── CAUSAL INFERENCE ── */}
        {tab === "causal" && causal && (
          <div className="space-y-6">
            {/* OLS */}
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">OLS Regression with Region Fixed Effects</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    shock_rate ~ regulated_dummy + region_FE + ε  ·  HC1 robust SE
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                  causal.ols.result.significant ? "bg-emerald-500 text-black" : "bg-zinc-700 text-zinc-300"
                }`}>
                  p = {causal.ols.result.p_value}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded bg-zinc-800/50 p-3 text-xs md:grid-cols-4">
                <Stat label="β regulated" value={`${causal.ols.result.beta_regulated}pp`} color="text-amber-400" />
                <Stat label="SE (HC1)" value={`${causal.ols.result.se_robust}pp`} />
                <Stat label="R²" value={causal.ols.result.r_squared} />
                <Stat label="N countries" value={causal.ols.result.n_total} />
              </div>
              <p className="mt-3 text-xs text-zinc-300">{causal.ols.interpretation}</p>
              <p className="mt-1 text-xs text-zinc-600 italic">
                Note: OLS with region FEs shows attenuation — geographic confounding absorbed.
                Mann-Whitney U (non-parametric, no distributional assumptions) is the primary inferential test.
              </p>
            </div>

            {/* DiD */}
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Difference-in-Differences (DiD)</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Natural experiment: COVID-19 oil shock · Mar 2020
                  </p>
                </div>
                <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs font-bold text-amber-400">
                  DiD = +{causal.did.result.did_estimate_pp}pp
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded bg-zinc-800/50 p-3 text-xs md:grid-cols-4 mb-4">
                <Stat label="Treated pre" value={`${causal.did.result.treated_pre_pct}%`} color="text-amber-400" />
                <Stat label="Treated post" value={`${causal.did.result.treated_post_pct}%`} color="text-amber-400" />
                <Stat label="Control pre" value={`${causal.did.result.control_pre_pct}%`} color="text-blue-400" />
                <Stat label="Control post" value={`${causal.did.result.control_post_pct}%`} color="text-blue-400" />
              </div>
              {causal.did.chart_data && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={causal.did.chart_data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                      <XAxis dataKey="date" tick={{ fill: CHART_STYLE.tick, fontSize: 9 }} tickLine={false} interval={1} />
                      <YAxis tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={32}
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <ReferenceLine x="2020-03" stroke="#ef4444" strokeDasharray="3 3"
                        label={{ value: "COVID shock", fill: "#ef4444", fontSize: 9 }} />
                      <Line type="monotone" dataKey="treated_avg_pct" name="Regulated (THA/MYS/IDN)"
                        stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="control_avg_pct" name="Deregulated (DEU/USA)"
                        stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="mt-2 text-xs text-zinc-300">{causal.did.interpretation}</p>
              <p className="mt-1 text-xs text-zinc-600 italic">{causal.did.citation}</p>
            </div>
          </div>
        )}

        {/* ── ABM ── */}
        {tab === "abm" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="min-w-48 flex-1">
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <span>Subsidy Level</span>
                  <span className="text-lg font-bold text-amber-400">{abmSubsidy}%</span>
                </label>
                <input type="range" min={0} max={80} step={10} value={abmSubsidy}
                  onChange={(e) => setAbmSubsidy(Number(e.target.value))}
                  className="w-full accent-amber-500" />
              </div>
              {abm && (
                <div className="flex gap-4 text-xs">
                  <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2">
                    <p className="text-red-400 font-bold text-lg">{abm.summary.peak_critical_pct}%</p>
                    <p className="text-zinc-400">Peak critical</p>
                  </div>
                  <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                    <p className="text-amber-400 font-bold text-lg">{abm.summary.q1_avg_critical_pct}%</p>
                    <p className="text-zinc-400">Q1 avg critical</p>
                  </div>
                  <div className="rounded border border-blue-500/30 bg-blue-500/10 px-3 py-2">
                    <p className="text-blue-400 font-bold text-lg">{abm.summary.q5_avg_critical_pct}%</p>
                    <p className="text-zinc-400">Q5 avg critical</p>
                  </div>
                </div>
              )}
            </div>

            {abm && !loading && (
              <>
                <div className="h-64">
                  <p className="mb-2 text-xs text-zinc-500">% of agents in critical state (energy poverty) by month</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={abm.monthly_series}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradQ1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                      <XAxis dataKey="month" tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={32}
                        tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={CHART_STYLE.tooltip}
                        formatter={(v: number, name: string) => [`${v}%`, name]}
                        labelFormatter={(l) => `Month ${l}`} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {abm.monthly_series.map((m: any) =>
                        m.shock_hit ? <ReferenceLine key={m.month} x={m.month} stroke="#f59e0b" strokeOpacity={0.4} /> : null
                      )}
                      {["Q1 (Bottom 20%)", "Q2", "Q3 (Middle)", "Q4", "Q5 (Top 20%)"].map((q) => (
                        <Area key={q} type="monotone"
                          dataKey={(d: any) => d.by_quintile[q]?.critical_pct ?? 0}
                          name={q}
                          stroke={abm.quintile_colors[q]}
                          fill={q === "Q1 (Bottom 20%)" ? "url(#gradQ1)" : "none"}
                          strokeWidth={q === "Q1 (Bottom 20%)" ? 2.5 : 1.5}
                          dot={false}
                          fillOpacity={1}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-zinc-500">
                  Amber vertical lines = shock events · 1,000 agents across 5 income quintiles ·
                  Calibrated from NESDC income distribution (Gini=0.417) · {abm.model_note?.slice(0,80)}...
                </p>
              </>
            )}
            {loading && <div className="h-64 flex items-center justify-center text-xs text-zinc-500 animate-pulse">Running simulation...</div>}
          </div>
        )}

        {/* ── OPTIMIZATION ── */}
        {tab === "optimize" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["balanced", "equity", "fiscal"] as const).map((p) => (
                <button key={p} onClick={() => setOptPriority(p)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition ${
                    optPriority === p ? "bg-amber-500 text-black" : "border border-zinc-700 text-zinc-400 hover:text-white"
                  }`}>
                  {p}
                </button>
              ))}
              <span className="ml-2 text-xs text-zinc-500 self-center">policy priority weights</span>
            </div>

            {opt && (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <OptCard label="Optimal Duration" value={`${opt.optimal_solution.duration_months}m`} color="text-amber-400" />
                  <OptCard label="Cash Transfer" value={`${Math.round(opt.optimal_solution.cash_transfer_fraction * 100)}%`} color="text-emerald-400" />
                  <OptCard label="Targeting Accuracy" value={`${Math.round(opt.optimal_solution.targeting_accuracy * 100)}%`} color="text-blue-400" />
                  <OptCard label="Welfare Loss" value={opt.optimal_solution.welfare_loss_value.toFixed(4)} color="text-zinc-300" />
                </div>

                <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">vs Fixed Benchmarks</p>
                  <div className="space-y-2">
                    {Object.entries(opt.vs_fixed_paths as Record<string, any>).map(([name, d]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-32 text-xs text-zinc-300 capitalize">{name.replace("_", " ")}</span>
                        <div className="flex-1 h-2 rounded bg-zinc-800">
                          <div className="h-2 rounded bg-amber-500/60 transition-all"
                            style={{ width: `${Math.min(100, d.welfare_loss * 1000)}%` }} />
                        </div>
                        <span className="w-20 text-right text-xs font-mono text-zinc-400">
                          loss={d.welfare_loss.toFixed(4)}
                        </span>
                        <span className={`text-xs font-mono ${d.improvement_vs_optimal_pct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {d.improvement_vs_optimal_pct > 0 ? `+${d.improvement_vs_optimal_pct}%` : "≈ optimal"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {opt.optimal_timeline && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={opt.optimal_timeline} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                        <XAxis dataKey="month" tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} tickLine={false} />
                        <YAxis tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                        <Tooltip contentStyle={CHART_STYLE.tooltip} labelFormatter={(l) => `Month ${l}`} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="subsidy_pct" name="Subsidy (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="shock_prob_pct" name="Shock prob (%)" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-xs text-zinc-500">{opt.interpretation}</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, color = "text-white" }: { label: string; value: any; color?: string }) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <p className={`font-mono font-bold ${color}`}>{value}</p>
    </div>
  );
}

function OptCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
    </div>
  );
}
