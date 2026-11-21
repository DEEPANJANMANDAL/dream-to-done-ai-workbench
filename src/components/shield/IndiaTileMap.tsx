import { useState } from "react";
import { cn } from "@/lib/utils";
import { STATES, type StateRow } from "@/lib/threat-data";

const COLS = 9;
const ROWS = 8;

function intensity(v: number, max: number) {
  return Math.sqrt(v / max);
}

export function IndiaTileMap({
  metric,
  selected,
  onSelect,
  compact = false,
}: {
  metric: (s: StateRow) => number;
  selected?: string | null;
  onSelect?: (code: string) => void;
  compact?: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...STATES.map(metric), 1);
  return (
    <div
      className="grid w-full gap-1 sm:gap-1.5"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
      role="list"
      aria-label="India states tile map"
    >
      {STATES.map((s) => {
        const v = metric(s);
        const t = intensity(v, max);
        const active = selected === s.code || hover === s.code;
        return (
          <button
            key={s.code}
            type="button"
            role="listitem"
            onClick={() => onSelect?.(s.code)}
            onMouseEnter={() => setHover(s.code)}
            onMouseLeave={() => setHover(null)}
            title={`${s.name}: ${v.toLocaleString("en-IN")}`}
            aria-label={`${s.name}: ${v.toLocaleString("en-IN")}`}
            aria-pressed={selected === s.code}
            className={cn(
              "relative aspect-square rounded-md border text-center transition-colors",
              compact ? "text-[10px]" : "text-[11px] sm:text-xs",
              active ? "z-10 border-foreground" : "border-transparent",
              onSelect ? "cursor-pointer" : "cursor-default",
            )}
            style={{
              gridColumnStart: s.col + 1,
              gridRowStart: s.row + 1,
              backgroundColor: `color-mix(in oklab, var(--destructive) ${Math.round(t * 85)}%, var(--surface-raised))`,
            }}
          >
            <span className="absolute inset-0 grid place-items-center font-mono text-foreground">{s.code}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MapLegend({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-subtle">
      <span>Low</span>
      <span className="h-1.5 w-20 rounded-full" style={{ backgroundImage: "linear-gradient(90deg, var(--surface-raised), var(--destructive))" }} />
      <span>High</span>
      <span className="ml-2 truncate font-sans text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}
