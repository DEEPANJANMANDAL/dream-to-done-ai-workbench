import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function Donut({ data, centerLabel, centerValue, unit = "" }: { data: { name: string; value: number; color: string }[]; centerLabel: string; centerValue: string; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
      <div className="relative mx-auto size-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={72} paddingAngle={3} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(v) => `${Number(v).toLocaleString("en-IN")}${unit}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-xl font-bold">{centerValue}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="min-w-0 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="truncate text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-mono">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
