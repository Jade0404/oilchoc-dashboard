export type MarketType = "regulated" | "deregulated";
export type ReformPath = "fast_cut" | "gradual" | "cash_transfer";
export type Lang = "en" | "th";

// ── Stress Tester ─────────────────────────────────────────────────────────────
export interface IncomeGroupData {
  shock_prob: number;
  monthly_cost_impact_usd: number;
  monthly_cost_impact_thb: number;
  fuel_expenditure_share: number;
  income_label_en: string;
}
export interface SweepPoint {
  subsidy_pct: number;
  overall: number;
  low: number;
  middle: number;
  high: number;
}
export interface StressTestResponse {
  monthly_shock_prob: number;
  annual_shock_prob: number;
  by_income_group: Record<"low" | "middle" | "high", IncomeGroupData>;
  sweep_curve: SweepPoint[];
  thailand_reference: {
    monthly_shock_rate_pct: number;
    observation_months: number;
    percentile_of_regulated: number;
    shock_ratio_observed: number;
    mann_whitney_p: number;
  };
}

// ── Reform Optimizer ──────────────────────────────────────────────────────────
export interface TimelinePoint {
  month: number;
  subsidy_pct: number;
  shock_prob: number;
  low_cost_usd: number;
  middle_cost_usd: number;
  high_cost_usd: number;
  delta_shock_pp: number;
}
export interface PathScores {
  duration_months: number;
  fiscal_savings_usd_bn: number;
  max_low_income_shock_pct: number;
  avg_low_income_cost_usd: number;
  speed_score: number;
  equity_score: number;
  fiscal_score: number;
  composite_score: number;
}
export interface ReformPathData {
  timeline: TimelinePoint[];
  scores: PathScores;
  label: string;
  description: string;
}
export interface ReformResponse {
  paths: Record<ReformPath, ReformPathData>;
}

// ── Evidence ──────────────────────────────────────────────────────────────────
export interface EvidenceSummary {
  shock_ratio: number;
  shock_ratio_ci: [number, number];
  p_value_mann_whitney: number;
  n_countries: number;
  n_regulated: number;
  n_deregulated: number;
  regulated_median_pct: number;
  deregulated_median_pct: number;
  observation_months: number;
  period: string;
}

export interface StatTestResult {
  test: string;
  result: Record<string, unknown>;
  interpretation: string;
  citation: string;
}
export interface StatDefence {
  verdict: {
    reject_null: boolean;
    conclusion: string;
    tests_passed: number;
    tests_total: number;
  };
  mann_whitney: StatTestResult & {
    hypotheses: Record<string, string>;
    descriptives: Record<string, number>;
  };
  ks_test: StatTestResult & { hypotheses: Record<string, string> };
  kurtosis: {
    concept: string;
    time_series: {
      per_country: Array<{
        country: string;
        group: string;
        excess_kurtosis: number;
        n_months: number;
        note: string;
      }>;
    };
    interpretation: string;
    citation: string;
  };
  bootstrap_ci: StatTestResult & {
    method: string;
    result: {
      regulated_median_pct: number;
      regulated_ci_95: [number, number];
      deregulated_median_pct: number;
      deregulated_ci_95: [number, number];
      ratio_point_estimate: number;
      ratio_ci_95: [number, number];
      difference_pp: number;
      difference_ci_95_pp: [number, number];
      ci_excludes_zero: boolean;
      ci_excludes_unity_ratio: boolean;
    };
  };
}

export interface CountryScatterPoint {
  country: string;
  code: string;
  group: "Regulated" | "Deregulated";
  region: string;
  shock_pct: number;
  volatility_pct: number;
  is_thailand: boolean;
}

export interface PriceTimelinePoint {
  date: string;
  price: number;
  mom_pct: number | null;
  is_shock: boolean;
}
export type PriceTimeline = Record<
  string,
  { group: string; series: PriceTimelinePoint[]; n_shocks: number }
>;
