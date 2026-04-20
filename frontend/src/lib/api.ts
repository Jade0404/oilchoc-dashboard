import {
  StressTestResponse,
  ReformResponse,
  MarketType,
  EvidenceSummary,
  StatDefence,
  CountryScatterPoint,
  PriceTimeline,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export const fetchStressTest = (subsidyLevel: number, marketType: MarketType) =>
  apiFetch<StressTestResponse>("/api/stress-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subsidy_level: subsidyLevel / 100, market_type: marketType }),
  });

export const fetchReformOptimize = (currentSubsidyPct: number) =>
  apiFetch<ReformResponse>("/api/reform-optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_subsidy_pct: currentSubsidyPct }),
  });

export const fetchEvidenceSummary = () =>
  apiFetch<EvidenceSummary>("/api/evidence/summary");

export const fetchStatDefence = () =>
  apiFetch<StatDefence>("/api/evidence/statistical-defence");

export const fetchCountryScatter = () =>
  apiFetch<CountryScatterPoint[]>("/api/evidence/country-scatter");

export const fetchPriceTimeline = () =>
  apiFetch<PriceTimeline>("/api/evidence/price-timeline");
