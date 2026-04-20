"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "./LanguageProvider";
import { useTranslations } from "@/lib/translations";
import { fetchStressTest } from "@/lib/api";
import { StressTestResponse, MarketType } from "@/types";

const LINE_COLORS = {
  low: "#f59e0b",
  middle: "#60a5fa",
  high: "#34d399",
};

const INITIAL_DATA: StressTestResponse = {
  monthly_shock_prob: 5.41,
  annual_shock_prob: 48.5,
  kurtosis_factor: 14,
  by_income_group: {
    low: { shock_prob: 0.0813, monthly_cost_impact_usd: 12.5, fuel_expenditure_share: 0.15 },
    middle: { shock_prob: 0.0541, monthly_cost_impact_usd: 8.3, fuel_expenditure_share: 0.09 },
    high: { shock_prob: 0.0271, monthly_cost_impact_usd: 5.1, fuel_expenditure_share: 0.04 },
  },
  sweep_curve: Array.from({ length: 21 }, (_, i) => ({
    subsidy_pct: i * 5,
    overall: 3 + i * 0.6,
    low: 4.5 + i * 0.9,
    middle: 3 + i * 0.6,
    high: 1.5 + i * 0.3,
  })),
  thailand_reference: { shocks: 4, months: 113, monthly_rate: 3.54, percentile_regulated: 63 },
};

export default function StressTester() {
  const { lang } = useLang();
  const tr = useTranslations(lang);

  const [subsidy, setSubsidy] = useState(30);
  const [marketType, setMarketType] = useState<MarketType>("regulated");
  const [data, setData] = useState<StressTestResponse>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchStressTest(subsidy, marketType);
      setData(result);
    } catch {
      // keep previous data if API unavailable
    } finally {
      setLoading(false);
    }
  }, [subsidy, marketType]);

  useEffect(() => {
    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, [load]);

  const { by_income_group: byGroup } = data;

  return (
    <section className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-xs font-bold text-black">
            A
          </span>
          <h2 className="text-xl font-bold text-white">{tr("toolATitle")}</h2>
        </div>
        <p className="mb-8 text-sm text-zinc-400">{tr("toolADesc")}</p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Market type toggle */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {tr("marketType")}
              </label>
              <div className="flex rounded border border-zinc-700 overflow-hidden">
                {(["regulated", "deregulated"] as MarketType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMarketType(t)}
                    className={`flex-1 py-2 text-xs font-medium transition ${
                      marketType === t
                        ? "bg-amber-500 text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t === "regulated" ? tr("regulated") : tr("deregulated")}
                  </button>
                ))}
              </div>
            </div>

            {/* Subsidy slider */}
            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <span>{tr("subsidyLevel")}</span>
                <span className="text-lg font-bold text-amber-400">{subsidy}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={subsidy}
                onChange={(e) => setSubsidy(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Summary stats */}
            <div className="space-y-3">
              <StatRow
                label={tr("monthlyShockProb")}
                value={`${data.monthly_shock_prob.toFixed(1)}%`}
                loading={loading}
              />
              <StatRow
                label={tr("annualShockProb")}
                value={`${data.annual_shock_prob.toFixed(1)}%`}
                loading={loading}
              />
            </div>

            {/* Income group breakdown */}
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              {(["low", "middle", "high"] as const).map((g) => {
                const item = byGroup[g];
                const label = g === "low" ? tr("lowIncome") : g === "middle" ? tr("middleIncome") : tr("highIncome");
                return (
                  <div key={g}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: LINE_COLORS[g] }}
                        />
                        <span className="text-zinc-300">{label}</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {(item.shock_prob * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(item.shock_prob * 100 * 5, 100)}%`,
                          background: LINE_COLORS[g],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {tr("shockProbBySubsidy")}
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sweep_curve} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="subsidy_pct"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickLine={false}
                    label={{ value: tr("subsidyAxis"), position: "insideBottom", offset: -2, fill: "#52525b", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    label={{ value: tr("shockProbAxis"), angle: -90, position: "insideLeft", fill: "#52525b", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#242220", border: "1px solid #403c37", borderRadius: 6, fontSize: 12 }}
                    labelStyle={{ color: "#a1a1aa" }}
                    itemStyle={{ color: "#e4e4e7" }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`]}
                    labelFormatter={(l) => `Subsidy: ${l}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
                  <ReferenceLine
                    x={subsidy}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: `${subsidy}%`, fill: "#f59e0b", fontSize: 11 }}
                  />
                  {/* Thailand reference line */}
                  <ReferenceLine
                    x={30}
                    stroke="#6b7280"
                    strokeDasharray="2 4"
                  />
                  <Line type="monotone" dataKey="low" name={tr("lowIncome")} stroke={LINE_COLORS.low} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="middle" name={tr("middleIncome")} stroke={LINE_COLORS.middle} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="high" name={tr("highIncome")} stroke={LINE_COLORS.high} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-right text-xs text-zinc-600">
              Thailand est. subsidy: ~30% · Amber line = current selection
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatRow({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`font-mono text-lg font-bold transition-opacity ${loading ? "opacity-50" : ""} text-white`}>
        {value}
      </span>
    </div>
  );
}
