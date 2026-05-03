"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useLang } from "../LanguageProvider";
import { useTranslations } from "@/lib/translations";

// Hardcoded price path data (static simulation, not fetched from API)
const pricePathData = Array.from({ length: 36 }, (_, i) => {
  const month = i + 1;
  return {
    month,
    // Path A: Fast cut — drops from 100 to 50 in 12 months
    fast: month <= 12 ? 100 - (month / 12) * 50 : 50,
    // Path B: Gradual — drops from 100 to 60 in 48 months
    gradual: Math.max(60, 100 - (month / 48) * 40),
    // Path C: Cash transfer — drops from 100 to 55 in 24 months
    cashTransfer: month <= 24 ? 100 - (month / 24) * 45 : 55,
  };
});

const paretofrontierData = [
  { x: 7.2, y: 11.5, label: "Path A (Fast Cut)", path: "A" },
  { x: 6.8, y: 8.3, label: "Path B (Gradual)", path: "B" },
  { x: 7.5, y: 7.1, label: "Path C (Cash Transfer)", path: "C" },
];

const policyScoreboardData = [
  { metric: "Fiscal Savings", A: 8, B: 6, C: 7 },
  { metric: "Q1 Welfare Protection", A: 3, B: 6, C: 9 },
  { metric: "Political Feasibility", A: 4, B: 8, C: 7 },
  { metric: "Shock Risk Reduction", A: 9, B: 6, C: 8 },
];

export default function ReformRoadmapSection() {
  const [activeTab, setActiveTab] = useState<"price" | "pareto" | "scorecard">(
    "price"
  );
  const { lang } = useLang();
  const tr = useTranslations(lang);

  return (
    <section className="border-t border-zinc-800 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          Reform Roadmap
        </h2>
        <p className="mb-8 text-sm text-zinc-400">
          Three pathways to structural reform — select α to navigate the
          welfare-fiscal tradeoff
        </p>

        {/* Tab buttons */}
        <div className="mb-8 flex gap-4 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("price")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "price"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Price Path
          </button>
          <button
            onClick={() => setActiveTab("pareto")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "pareto"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Pareto Frontier
          </button>
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === "scorecard"
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Policy Scorecard
          </button>
        </div>

        {/* Tab content */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          {activeTab === "price" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Price Index Over 36 Months (base=100)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={pricePathData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                  <XAxis dataKey="month" stroke="#999999" />
                  <YAxis stroke="#999999" domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1b19",
                      border: "1px solid #3a3632",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="fast"
                    stroke="#C0392B"
                    name="Fast Cut"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="gradual"
                    stroke="#D4860A"
                    name="Gradual Phase-Out"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="cashTransfer"
                    stroke="#1A7A3C"
                    name="Cash Transfer Switch"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "pareto" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Pareto Frontier: Fiscal Savings vs Q1 Welfare Burden
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart
                  margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                  <XAxis
                    dataKey="x"
                    name="Fiscal Savings Index"
                    stroke="#999999"
                    type="number"
                  />
                  <YAxis
                    dataKey="y"
                    name="Q1 Welfare Burden (%)"
                    stroke="#999999"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1b19",
                      border: "1px solid #3a3632",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter name="Reform Paths" data={paretofrontierData}>
                    {paretofrontierData.map((entry, index) => {
                      const colors: Record<string, string> = {
                        A: "#C0392B",
                        B: "#D4860A",
                        C: "#1A7A3C",
                      };
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[entry.path] || "#b8742a"}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-1 text-xs text-zinc-400">
                <p>
                  Path A (Fast Cut): {paretofrontierData[0].label} | Path B (Gradual): {paretofrontierData[1].label} |
                  Path C (Cash Transfer): {paretofrontierData[2].label}
                </p>
                <p>Path C dominates — lower welfare loss, comparable fiscal savings</p>
              </div>
            </div>
          )}

          {activeTab === "scorecard" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-300">
                Policy Performance Across Key Metrics (0-10 scale)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={policyScoreboardData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 200 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3632" />
                  <XAxis type="number" stroke="#999999" domain={[0, 10]} />
                  <YAxis dataKey="metric" type="category" stroke="#999999" width={195} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1b19",
                      border: "1px solid #3a3632",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="A" fill="#b8742a" name="Fast Cut" />
                  <Bar dataKey="B" fill="#3a7ca5" name="Gradual" />
                  <Bar dataKey="C" fill="#50a084" name="Cash Transfer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
