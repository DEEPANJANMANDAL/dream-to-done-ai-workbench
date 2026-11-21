/** A share shown as a ranked list with thin bars. The largest share leads in the accent, the rest stay neutral. */
export function ShareList({ data, unit = "" }: { data: { name: string; value: number }[]; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const rows = [...data].sort((a, b) => b.value - a.value);
  const max = rows[0]?.value ?? 1;
  return (
    <ul className="space-y-3">
      {rows.map((d, i) => (
        <li key={d.name} className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 text-sm">
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="font-mono text-[13px] tabular-nums" title={`${d.value.toLocaleString("en-IN")}${unit}`}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-raised">
            <div className={i === 0 ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-subtle/60"} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
