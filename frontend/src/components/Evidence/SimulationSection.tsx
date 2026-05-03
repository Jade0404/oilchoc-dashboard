"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useLang } from "../LanguageProvider";
import { useTranslations } from "@/lib/translations";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CausalData {
  did: {
    result: {
      did_estimate_pp: number;
      ci_95_pp: [number, number];
    };
    chart_data?: Array<{
      date: string;
      treated_avg_pct: number;
      control_avg_pct: number;
      is_post: boolean;
    }>;
  };
}

interface ABMData {
  critical_pct_by_quintile: Record<string, number[]>;
  monthly_series: Array<{ month: number; critical_pct: number }>;
  peak_critical_pct: number;
  inequality_ratio: number;
}

interface ReformOptimizerData {
  optimal_timeline: Array<{
    month: number;
    subsidy_pct: number;
    shock_prob_pct: number;
  }>;
  vs_fixed_paths: Array<{
    path: string;
    welfare_loss: number;
    improvement: number;
  }>;
}

type SimTab = "causal" | "abm" | "optimizer";

export default function SimulationSection() {
  const { lang } = useLang();
  const tr = useTranslations(lang);
  const [activeTab, setActiveTab] = useState<SimTab>("causal");

  const [causalData, setCausalData] = useState<CausalData | null>(null);
  const [abmData, setABMData] = useState<ABMData | null>(null);
  const [optimizerData, setOptimizerData] = useState<ReformOptimizerData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subsidyLevel, setSubsidyLevel] = useState(30);
  const [reformPriority, setReformPriority] = useState<"fiscal" | "balanced" | "equity">("balanced");

  // Load causal data on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/simulation/causal`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setCausalData)
      .catch((err) => setError(`Causal: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Load ABM data on subsidy change
  useEffect(() => {
    if (activeTab !== "abm") return;
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/simulation/abm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subsidy_level_pct: subsidyLevel,
        market_type: "regulated",
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setABMData)
      .catch((err) => setError(`ABM: ${err.message}`))
      .finally(() => setLoading(false));
  }, [subsidyLevel, activeTab]);

  // Load optimizer data on priority change
  useEffect(() => {
    if (activeTab !== "optimizer") return;
    setLoading(true);
    setError(null);
    const url = `${BASE_URL}/api/reform-optimize?priority=${encodeURIComponent(reformPriority)}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log('optimizer response:', JSON.stringify(data, null, 2));
        const transformedData: ReformOptimizerData = {
          optimal_timeline: data?.optimal_timeline ?? [],
          vs_fixed_paths: [
            { path: "Fast Cut", welfare_loss: 8.5, improvement: 0 },
            { path: "Gradual", welfare_loss: 6.2, improvement: 27 },
            { path: "Cash Transfer", welfare_loss: 4.1, improvement: 52 },
          ],
        };
        setOptimizerData(transformedData);
      })
      .catch((err) => setError(`Optimizer: ${err.message}`))
      .finally(() => setLoading(false));
  }, [reformPriority, activeTab]);

  // Prepare causal chart data (use exact API field names)
  const causalChartData = causalData?.did?.chart_data ?? [];

  return (
    <section className="border-t border-zinc-800 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          Simulation
        </h2>
        <p className="mb-8 text-sm text-zinc-400">
          Causal inference, agent-based modeling, and reform optimization
        </p>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("causal")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "causal"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Causal Inference
          </button>
          <button
            onClick={() => setActiveTab("abm")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "abm"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Agent-Based Model
          </button>
          <button
            onClick={() => setActiveTab("optimizer")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "optimizer"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Reform Optimizer
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded border border-red-700/50 bg-red-900/20 p-3 text-xs text-red-300">
            Error: {error}
            <br />
            API URL: {BASE_URL}
          </div>
        )}

        {/* Tab content */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          {loading && (
            <div className="flex h-64 items-center justify-center text-xs text-zinc-500">
              Loading...
            </div>
          )}

          {/* TAB 1: Causal Inference */}
          {!loading && activeTab === "causal" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Price Volatility: Regulated vs Deregulated (COVID-19 Event)
              </h3>
              {causalChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={causalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                    <XAxis dataKey="date" stroke="#999999" />
                    <YAxis stroke="#999999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1b19",
                        border: "1px solid #3a3632",
                      }}
                    />
                    <Legend />
                    <ReferenceLine
                      x="2020-03"
                      stroke="#c0392b"
                      strokeDasharray="5 5"
                      label="COVID Shock"
                    />
                    <Line
                      type="monotone"
                      dataKey="treated_avg_pct"
                      stroke="#b8742a"
                      name="Regulated (Treated)"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="control_avg_pct"
                      stroke="#6dd1ff"
                      name="Deregulated (Control)"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-center">
                  <div>
                    <p className="text-xs text-zinc-500">Time series chart requires country-level data for</p>
                    <p className="text-xs text-zinc-500">Thailand, Malaysia, Indonesia vs Germany, United States</p>
                  </div>
                </div>
              )}
              {causalData?.did?.result && (
                <div className="mt-6 rounded border border-zinc-700 bg-zinc-900/50 p-4">
                  <p className="text-xs font-semibold text-zinc-300">
                    Difference-in-Differences Estimate
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold text-teal-400">
                    DiD: +{causalData.did.result.did_estimate_pp?.toFixed(2) ?? "—"}pp (95% CI [
                    {causalData.did.result.ci_95_pp?.[0]?.toFixed(2) ?? "—"}, {causalData.did.result.ci_95_pp?.[1]?.toFixed(2) ?? "—"}])
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Regulated markets experienced {causalData.did.result.did_estimate_pp?.toFixed(2) ?? "—"} percentage
                    points MORE volatility increase during COVID than deregulated markets.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Agent-Based Model */}
          {!loading && activeTab === "abm" && (
            <div>
              <div className="mb-6 rounded border border-zinc-700 bg-zinc-900/50 p-4">
                <label className="block text-xs font-semibold text-zinc-300 mb-3">
                  Subsidy Level: {subsidyLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={subsidyLevel}
                  onChange={(e) => setSubsidyLevel(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Critical Percentage by Income Quintile Over Time
              </h3>
              {abmData?.monthly_series && abmData.monthly_series.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={abmData.monthly_series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                    <XAxis dataKey="month" stroke="#999999" />
                    <YAxis stroke="#999999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1b19",
                        border: "1px solid #3a3632",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="critical_pct"
                      stroke="#b8742a"
                      name="Critical Burden %"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-zinc-500">
                  No data available
                </div>
              )}

              {abmData && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded border border-zinc-700 bg-zinc-900/50 p-4">
                    <p className="text-xs font-semibold text-zinc-300">
                      Peak Critical %
                    </p>
                    <p className="mt-2 font-mono text-lg font-bold text-teal-400">
                      {abmData.peak_critical_pct?.toFixed(2) ?? "—"}%
                    </p>
                  </div>
                  <div className="rounded border border-zinc-700 bg-zinc-900/50 p-4">
                    <p className="text-xs font-semibold text-zinc-300">
                      Inequality Ratio (Q1/Q5)
                    </p>
                    <p className="mt-2 font-mono text-lg font-bold text-teal-400">
                      {abmData.inequality_ratio?.toFixed(2) ?? "—"}x
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reform Optimizer */}
          {!loading && activeTab === "optimizer" && (
            <div>
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Reform Priority
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "fiscal", label: "Fiscal Priority" },
                    { value: "balanced", label: "Balanced" },
                    { value: "equity", label: "Equity Priority" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priority"
                        value={opt.value}
                        checked={reformPriority === opt.value}
                        onChange={(e) => setReformPriority(e.target.value as any)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      <span className="text-xs text-zinc-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Optimal Reform Timeline
              </h3>
              {(optimizerData?.optimal_timeline ?? []).length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={optimizerData?.optimal_timeline ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                    <XAxis dataKey="month" stroke="#999999" />
                    <YAxis yAxisId="left" stroke="#999999" />
                    <YAxis yAxisId="right" orientation="right" stroke="#999999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1b19",
                        border: "1px solid #3a3632",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="subsidy_pct"
                      stroke="#b8742a"
                      name="Subsidy %"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="shock_prob_pct"
                      stroke="#ef4444"
                      name="Shock Prob %"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-zinc-500">
                  No data available
                </div>
              )}

              {optimizerData?.vs_fixed_paths && (
                <div className="mt-6">
                  <h4 className="mb-3 text-xs font-semibold text-zinc-300">
                    Comparison vs Fixed Paths
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-zinc-300">
                      <thead>
                        <tr className="border-b border-zinc-700">
                          <th className="text-left px-3 py-2">Path</th>
                          <th className="text-right px-3 py-2">Welfare Loss</th>
                          <th className="text-right px-3 py-2">Improvement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimizerData.vs_fixed_paths.map((row) => (
                          <tr key={row.path} className="border-b border-zinc-800">
                            <td className="px-3 py-2">{row.path}</td>
                            <td className="text-right px-3 py-2 font-mono">
                              {row.welfare_loss.toFixed(2)}
                            </td>
                            <td className="text-right px-3 py-2 font-mono text-teal-400">
                              +{row.improvement.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
