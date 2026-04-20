"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { PriceTimeline as PriceTimelineType } from "@/types";

const COUNTRY_STYLE: Record<string, { color: string; dash?: string }> = {
  Thailand:       { color: "#f59e0b" },
  Malaysia:       { color: "#fb923c", dash: "5 3" },
  Indonesia:      { color: "#fbbf24", dash: "3 3" },
  Germany:        { color: "#60a5fa" },
  "United States":{ color: "#818cf8", dash: "5 3" },
};

const SHOCK_DATES: Record<string, string> = {
  "2020-03": "COVID-19",
  "2022-03": "Ukraine War",
};

interface Props {
  data: PriceTimelineType;
  lang: "en" | "th";
}

export default function PriceTimeline({ data, lang }: Props) {
  // Merge all series onto shared date axis
  const allDates = [...new Set(
    Object.values(data).flatMap((c) => c.series.map((s) => s.date))
  )].sort();

  const merged = allDates.map((date) => {
    const row: Record<string, string | number | null> = { date };
    for (const [country, { series }] of Object.entries(data)) {
      const pt = series.find((s) => s.date === date);
      row[country] = pt ? pt.price : null;
    }
    return row;
  });

  const allShockDates = new Set(
    Object.values(data).flatMap((c) =>
      c.series.filter((s) => s.is_shock).map((s) => s.date)
    )
  );

  const yLabel = lang === "th" ? "ราคาต่อลิตร (USD)" : "Price per litre (USD)";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-zinc-400">
        {Object.entries(data).map(([country, { group, n_shocks }]) => (
          <span key={country} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-5 rounded"
              style={{
                background: COUNTRY_STYLE[country]?.color ?? "#888",
                opacity: 0.9,
              }}
            />
            <span className="text-zinc-300">{country}</span>
            <span className={group === "Regulated" ? "text-amber-500" : "text-blue-400"}>
              [{group === "Regulated" ? "REG" : "DEREG"}]
            </span>
            <span className="text-zinc-600">{n_shocks} shocks</span>
          </span>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 9 }}
              tickLine={false}
              interval={11}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={38}
              label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#52525b", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ background: "#242220", border: "1px solid #403c37", borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(v: number, name: string) => [`$${v?.toFixed(3)}`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />

            {/* Shock event markers */}
            {[...allShockDates].slice(0, 8).map((date) => (
              <ReferenceLine
                key={date}
                x={date}
                stroke="#ef4444"
                strokeOpacity={0.3}
                strokeWidth={1}
                label={
                  SHOCK_DATES[date]
                    ? { value: SHOCK_DATES[date], fill: "#ef4444", fontSize: 8, position: "top" }
                    : undefined
                }
              />
            ))}

            {Object.entries(data).map(([country]) => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={COUNTRY_STYLE[country]?.color ?? "#888"}
                strokeWidth={country === "Thailand" ? 2.5 : 1.5}
                strokeDasharray={COUNTRY_STYLE[country]?.dash}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-right text-xs text-zinc-600">
        Red lines = shock events (&gt;10% monthly change) ·
        Source: World Bank Global Fuel Prices Database
      </p>
    </div>
  );
}
