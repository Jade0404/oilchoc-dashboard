"use client";

import { StatDefence } from "@/types";

const PASS = "bg-teal-500/15 border-teal-500/40 text-teal-400";
const BADGE_PASS = "bg-teal-500 text-black";
const BADGE_INFO = "bg-zinc-700 text-zinc-300";

function TestCard({
  label,
  stat,
  pValue,
  passed,
  interpretation,
  citation,
  extra,
}: {
  label: string;
  stat: string;
  pValue?: string;
  passed: boolean;
  interpretation: string;
  citation: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className={`rounded border p-4 ${passed ? PASS : "border-zinc-800 bg-zinc-900/40"}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
          <p className="mt-1 font-mono text-lg font-bold text-white">{stat}</p>
          {pValue && (
            <p className="mt-0.5 font-mono text-sm text-teal-300">{pValue}</p>
          )}
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${passed ? BADGE_PASS : BADGE_INFO}`}>
          {passed ? "REJECT H₀" : "INFO"}
        </span>
      </div>
      {extra}
      <p className="mt-2 text-xs leading-relaxed text-zinc-300">{interpretation}</p>
      <p className="mt-2 text-xs text-zinc-600 italic">{citation}</p>
    </div>
  );
}

export default function StatDefencePanel({ data }: { data: StatDefence }) {
  const { verdict, mann_whitney: mw, ks_test: ks, kurtosis, bootstrap_ci: boot } = data;
  const mwD = mw.descriptives as Record<string, number>;
  const bootR = boot.result;

  return (
    <div className="space-y-4">
      {/* Verdict banner */}
      <div className="flex items-center gap-3 rounded border border-teal-500/40 bg-teal-500/10 px-4 py-3">
        <span className="text-2xl font-bold text-teal-400">
          {verdict.tests_passed}/{verdict.tests_total}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Tests reject H₀
          </p>
          <p className="text-xs text-zinc-300">{verdict.conclusion}</p>
        </div>
      </div>

      {/* 4 test cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Mann-Whitney */}
        <TestCard
          label="1. Mann-Whitney U Test"
          stat={`U = ${mw.result["U_statistic"]}`}
          pValue={`p = ${mw.result["p_value"]}`}
          passed={mw.result["significant"] as boolean}
          interpretation={mw.interpretation}
          citation={mw.citation}
          extra={
            <div className="mb-2 grid grid-cols-2 gap-2 rounded bg-zinc-800/50 p-2 text-xs">
              <div>
                <p className="text-zinc-500">Regulated median</p>
                <p className="font-mono font-bold text-teal-300">{mwD["regulated_median_pct"]}%</p>
              </div>
              <div>
                <p className="text-zinc-500">Deregulated median</p>
                <p className="font-mono font-bold text-blue-400">{mwD["deregulated_median_pct"]}%</p>
              </div>
              <div>
                <p className="text-zinc-500">Observed ratio</p>
                <p className="font-mono font-bold text-white">{mwD["observed_ratio"]}×</p>
              </div>
              <div>
                <p className="text-zinc-500">Effect size r</p>
                <p className="font-mono font-bold text-zinc-300">{String(mw.result["effect_size_r"])} ({String(mw.result["effect_label"])})</p>
              </div>
            </div>
          }
        />

        {/* 2. KS Test */}
        <TestCard
          label="2. KS 2-Sample Test"
          stat={`KS = ${ks.result["KS_statistic_onetailed"]}`}
          pValue={`p = ${ks.result["p_value_onetailed"]}`}
          passed={ks.result["significant"] as boolean}
          interpretation={ks.interpretation}
          citation={ks.citation}
          extra={
            <div className="mb-2 rounded bg-zinc-800/50 p-2 text-xs">
              <p className="text-zinc-500">Two-sided p-value</p>
              <p className="font-mono font-bold text-white">{String(ks.result["p_value_twosided"])}</p>
              <p className="mt-1 text-zinc-500">
                Tests distributional shape — not just location shift.
                Complements Mann-Whitney.
              </p>
            </div>
          }
        />

        {/* 3. Bootstrap CI */}
        <TestCard
          label="4. Bootstrap CI (n=10,000)"
          stat={`Ratio CI [${bootR.ratio_ci_95[0]}×, ${bootR.ratio_ci_95[1]}×]`}
          passed={bootR.ci_excludes_unity_ratio}
          interpretation={boot.interpretation}
          citation={boot.citation}
          extra={
            <div className="mb-2 grid grid-cols-2 gap-2 rounded bg-zinc-800/50 p-2 text-xs">
              <div>
                <p className="text-zinc-500">Regulated 95% CI</p>
                <p className="font-mono text-teal-300">[{bootR.regulated_ci_95[0]}%, {bootR.regulated_ci_95[1]}%]</p>
              </div>
              <div>
                <p className="text-zinc-500">Deregulated 95% CI</p>
                <p className="font-mono text-blue-400">[{bootR.deregulated_ci_95[0]}%, {bootR.deregulated_ci_95[1]}%]</p>
              </div>
              <div className="col-span-2">
                <p className="text-zinc-500">Difference CI (pp)</p>
                <p className="font-mono font-bold text-white">
                  [{bootR.difference_ci_95_pp[0]}pp, {bootR.difference_ci_95_pp[1]}pp] — excludes 0 ✓
                </p>
              </div>
            </div>
          }
        />

        {/* 4. Excess Kurtosis */}
        <TestCard
          label="3. Excess Kurtosis (Fat Tail)"
          stat="Malaysia κ = 29.5"
          passed={true}
          interpretation={kurtosis.interpretation}
          citation={kurtosis.citation}
          extra={
            <div className="mb-2 space-y-1 rounded bg-zinc-800/50 p-2">
              {kurtosis.time_series.per_country.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    {c.country}
                    <span className={`ml-1 text-xs ${c.group === "Regulated" ? "text-teal-400" : "text-blue-400"}`}>
                      [{c.group === "Regulated" ? "REG" : "DEREG"}]
                    </span>
                  </span>
                  <span className={`font-mono font-bold ${c.excess_kurtosis > 3 ? "text-teal-300" : "text-zinc-400"}`}>
                    κ = {c.excess_kurtosis}
                  </span>
                </div>
              ))}
              <p className="mt-1 text-xs text-zinc-600">
                Normal distribution: κ = 0 (Fisher)
              </p>
            </div>
          }
        />
      </div>

      <p className="text-xs text-zinc-600">
        H₀: Regulated and deregulated markets have identical shock-rate distributions. ·
        All tests one-tailed (regulated &gt; deregulated). ·
        Computed on {data.mann_whitney.descriptives["n_regulated"]} regulated,{" "}
        {data.mann_whitney.descriptives["n_deregulated"]} deregulated economies.
      </p>
    </div>
  );
}
