"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CountryScatterPoint } from "@/types";

const GROUP_COLOR: Record<string, string> = {
  Regulated:   "#f59e0b",
  Deregulated: "#60a5fa",
};

interface Props {
  data: CountryScatterPoint[];
  lang: "en" | "th";
}

const CustomDot = (props: {
  cx?: number; cy?: number; payload?: CountryScatterPoint;
}) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  if (payload.is_thailand) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
        <text x={cx + 10} y={cy + 4} fontSize={10} fill="#f59e0b" fontWeight="bold">
          THA
        </text>
      </g>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.group === "Regulated" ? 3 : 2.5}
      fill={GROUP_COLOR[payload.group]}
      fillOpacity={0.55}
    />
  );
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CountryScatterPoint }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-white">{d.country} <span className="text-zinc-500">({d.code})</span></p>
      <p className={d.group === "Regulated" ? "text-amber-400" : "text-blue-400"}>{d.group}</p>
      <p className="text-zinc-300">Shock rate: <span className="font-mono font-bold">{d.shock_pct}%</span></p>
      <p className="text-zinc-300">Volatility: <span className="font-mono">{d.volatility_pct}%</span></p>
    </div>
  );
};

export default function CountryScatter({ data, lang }: Props) {
  const reg   = data.filter((d) => d.group === "Regulated");
  const dereg = data.filter((d) => d.group === "Deregulated");

  const regMedianShock   = reg.reduce((a, d) => a + d.shock_pct, 0) / reg.length;
  const deregMedianShock = dereg.reduce((a, d) => a + d.shock_pct, 0) / dereg.length;

  const xLabel = lang === "th" ? "ความผันผวนปกติ (%)" : "Normal Volatility (%)";
  const yLabel = lang === "th" ? "อัตราราคากระชาก (%/เดือน)" : "Shock Rate (%/month)";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
        <span>
          <span className="font-mono font-bold text-amber-400">{regMedianShock.toFixed(2)}%</span>
          {" "}regulated median
        </span>
        <span>vs</span>
        <span>
          <span className="font-mono font-bold text-blue-400">{deregMedianShock.toFixed(2)}%</span>
          {" "}deregulated median
        </span>
        <span className="text-zinc-600">·</span>
        <span>{data.length} countries</span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="volatility_pct"
              type="number"
              name={xLabel}
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              label={{ value: xLabel, position: "insideBottom", offset: -8, fill: "#52525b", fontSize: 10 }}
            />
            <YAxis
              dataKey="shock_pct"
              type="number"
              name={yLabel}
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={36}
              label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 10, fill: "#52525b", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
              formatter={(v) => <span style={{ color: v === "Regulated" ? "#f59e0b" : "#60a5fa" }}>{v}</span>}
            />
            <ReferenceLine
              y={regMedianShock}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={deregMedianShock}
              stroke="#60a5fa"
              strokeDasharray="4 3"
              strokeOpacity={0.5}
            />
            <Scatter name="Regulated"   data={reg}   shape={<CustomDot />} />
            <Scatter name="Deregulated" data={dereg} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-right text-xs text-zinc-600">
        Source: World Bank Global Fuel Prices Database · Dashed lines = group medians
      </p>
    </div>
  );
}
