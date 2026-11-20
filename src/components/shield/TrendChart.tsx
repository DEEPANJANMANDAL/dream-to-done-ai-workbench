import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { NATIONAL_TIMELINE } from "@/lib/threat-data";

export function NationalTrendChart({ height = 220 }: { height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={NATIONAL_TIMELINE} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="reportedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--info)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="estimatedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value, name) => [Number(value).toLocaleString("en-IN"), name === "reported" ? "Reported (NCRB)" : "Estimated"]}
          />
          <Area type="monotone" dataKey="estimated" stroke="var(--violet)" strokeDasharray="5 4" strokeWidth={2} fill="url(#estimatedFill)" connectNulls />
          <Area type="monotone" dataKey="reported" stroke="var(--info)" strokeWidth={2.5} fill="url(#reportedFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
