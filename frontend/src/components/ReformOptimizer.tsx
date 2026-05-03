"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "./LanguageProvider";
import { useTranslations } from "@/lib/translations";
import { fetchReformOptimize } from "@/lib/api";
import { ReformResponse, ReformPath } from "@/types";

const PATH_COLORS: Record<ReformPath, string> = {
  fast_cut: "#f59e0b",
  gradual: "#60a5fa",
  cash_transfer: "#34d399",
};

const PATH_ORDER: ReformPath[] = ["fast_cut", "gradual", "cash_transfer"];

function buildFallbackPath(durationMonths: number, startSubsidy: number): ReformResponse["paths"][ReformPath] {
  const timeline = Array.from({ length: durationMonths + 12 }, (_, i) => ({
    month: i + 1,
    subsidy_pct: Math.max(0, startSubsidy * (1 - (i + 1) / durationMonths) * 100),
    shock_prob: 3.5 + (i < durationMonths ? (i / durationMonths) * 4 : 4),
    low_cost_usd: 8 + i * 0.15,
    middle_cost_usd: 5 + i * 0.1,
    high_cost_usd: 2 + i * 0.04,
    delta_shock_pp: 0,
  }));
  return {
    timeline,
    scores: {
      duration_months: durationMonths,
      fiscal_savings_usd_bn: 2.1,
      max_low_income_shock_pct: 8.5,
      avg_low_income_cost_usd: 11.2,
      speed_score: 80,
      equity_score: 60,
      fiscal_score: 75,
      composite_score: 70,
    },
    label: "Fast Cut",
    description: "Full removal in 12 months.",
  };
}

const FALLBACK_DATA: ReformResponse = {
  paths: {
    fast_cut: buildFallbackPath(12, 0.3),
    gradual: buildFallbackPath(48, 0.3),
    cash_transfer: buildFallbackPath(24, 0.3),
  },
};

export default function ReformOptimizer() {
  const { lang } = useLang();
  const tr = useTranslations(lang);

  const [subsidy, setSubsidy] = useState(30);
  const [data, setData] = useState<ReformResponse>(FALLBACK_DATA);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchReformOptimize("balanced");
      setData(result);
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, [load]);

  const pathLabelKey: Record<ReformPath, "fastCut" | "gradual" | "cashTransfer"> = {
    fast_cut: "fastCut",
    gradual: "gradual",
    cash_transfer: "cashTransfer",
  };

  const best = PATH_ORDER.reduce<ReformPath>((acc, p) => {
    const aScore = data.paths[acc]?.scores.composite_score ?? 0;
    const bScore = data.paths[p]?.scores.composite_score ?? 0;
    return bScore > aScore ? p : acc;
  }, "fast_cut");

  return (
    <section className="border-t border-zinc-800 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-xs font-bold text-black">
            B
          </span>
          <h2 className="text-xl font-bold text-white">{tr("toolBTitle")}</h2>
        </div>
        <p className="mb-6 text-sm text-zinc-400">{tr("toolBDesc")}</p>

        {/* Subsidy input */}
        <div className="mb-8 flex flex-wrap items-center gap-6">
          <div className="min-w-48 flex-1">
            <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span>{tr("currentSubsidy")}</span>
              <span className="text-lg font-bold text-amber-400">{subsidy}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={subsidy}
              onChange={(e) => setSubsidy(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div className="shrink-0 rounded border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
            Best path: <strong>{tr(pathLabelKey[best])}</strong> (score {data.paths[best]?.scores.composite_score})
          </div>
        </div>

        {/* Path cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PATH_ORDER.map((path) => {
            const pathData = data.paths[path];
            if (!pathData) return null;
            const { scores, timeline } = pathData;
            const color = PATH_COLORS[path];
            const isBest = path === best;
            const chartData = timeline.slice(0, scores.duration_months + 6);

            return (
              <div
                key={path}
                className={`rounded border bg-zinc-900/50 p-5 transition ${
                  isBest ? "border-amber-500/60 ring-1 ring-amber-500/30" : "border-zinc-800"
                }`}
              >
                {/* Card header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {tr(pathLabelKey[path])}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {scores.duration_months} {tr("transitionMonths")}
                    </p>
                  </div>
                  {isBest && (
                    <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                      BEST
                    </span>
                  )}
                </div>

                {/* Timeline chart */}
                <div className="mb-4 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${path}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#242220", border: "1px solid #403c37", borderRadius: 6, fontSize: 11 }}
                        labelStyle={{ color: "#a1a1aa" }}
                        formatter={(v: number) => [`${v.toFixed(1)}%`]}
                        labelFormatter={(l) => `Month ${l}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="shock_prob"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#grad-${path})`}
                        dot={false}
                        name={tr("monthlyShockProb")}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mb-4 text-right text-xs text-zinc-600">{tr("timeline")}</p>

                {/* Score bars */}
                <div className="space-y-2">
                  <ScoreBar label={tr("fiscalScore")} value={scores.fiscal_score} color={color} />
                  <ScoreBar label={tr("equityScore")} value={scores.equity_score} color={color} />
                  <ScoreBar label={tr("speedScore")} value={scores.speed_score} color={color} />
                </div>

                {/* Key metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4">
                  <Metric
                    label={tr("fiscalSavings")}
                    value={`$${scores.fiscal_savings_usd_bn.toFixed(1)}B`}
                    color={color}
                  />
                  <Metric
                    label={tr("maxLowShock")}
                    value={`${scores.max_low_income_shock_pct.toFixed(1)}%`}
                    color={color}
                  />
                </div>

                {/* Composite */}
                <div
                  className="mt-4 flex items-center justify-between rounded p-3"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <span className="text-xs font-medium text-zinc-300">
                    {tr("compositeScore")}
                  </span>
                  <span className={`text-2xl font-bold`} style={{ color }}>
                    {scores.composite_score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-300">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
