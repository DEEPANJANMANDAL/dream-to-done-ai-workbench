import type { ReactNode } from "react";
import { Activity, AlertTriangle, CheckCircle2, Phone, ShieldAlert } from "lucide-react";
import type { BaseVerdict } from "@/lib/scam-types";
import { Panel, RiskGauge, VerdictPill } from "./ui";
import { Button } from "@/components/ui/button";

export function VerdictPanel({ result, loading, error, emptyText, children }: { result: BaseVerdict | null; loading: boolean; error: string | null; emptyText: string; children?: ReactNode }) {
  if (loading) {
    return (
      <Panel className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 animate-scan-line bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <Activity className="mb-3 size-6 animate-pulse text-primary" />
        <p className="text-sm font-medium">Analysing…</p>
        <p className="mt-1 text-xs text-muted-foreground">Checking against known Indian scam patterns</p>
      </Panel>
    );
  }
  if (error) {
    return (
      <Panel className="flex min-h-72 flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-3 size-6 text-warning" />
        <p className="max-w-xs text-sm">{error}</p>
      </Panel>
    );
  }
  if (!result) {
    return (
      <Panel className="grid-lines flex min-h-72 flex-col items-center justify-center text-center">
        <Activity className="mb-3 size-6 text-muted-foreground" />
        <p className="max-w-xs text-sm text-muted-foreground">{emptyText}</p>
      </Panel>
    );
  }
  return (
    <Panel className="space-y-5">
      <div className="text-center">
        <RiskGauge score={result.riskScore} />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <VerdictPill verdict={result.verdict} />
          <span className="text-xs text-muted-foreground">{result.category}</span>
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed">{result.summary}</p>
      </div>
      {children}
      {result.redFlags.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldAlert className="size-3.5 text-destructive" /> Red flags
          </h3>
          <ul className="space-y-1.5">
            {result.redFlags.map((f) => (
              <li key={f} className="flex gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                <span className="min-w-0">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.nextSteps.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-safe" /> What to do
          </h3>
          <ol className="space-y-1.5">
            {result.nextSteps.map((s, i) => (
              <li key={s} className="flex gap-2.5 text-sm">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[10px]">{i + 1}</span>
                <span className="min-w-0">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {result.verdict !== "safe" && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs">Already paid or shared details? Act within the golden hour.</p>
          <Button asChild variant="danger" size="sm">
            <a href="tel:1930">
              <Phone /> Call 1930
            </a>
          </Button>
        </div>
      )}
    </Panel>
  );
}
