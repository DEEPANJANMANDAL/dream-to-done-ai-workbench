import type { ReactNode } from "react";
import { AlertTriangle, Phone } from "lucide-react";
import type { BaseVerdict } from "@/lib/scam-types";
import { Panel, RiskGauge, SmsBubble, VerdictPill } from "./ui";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const verdictBorder = { scam: "border-destructive/40", suspicious: "border-warning/40", safe: "border-safe/40" } as const;

export function VerdictPanel({
  result,
  loading,
  error,
  emptyText,
  message,
  children,
}: {
  result: BaseVerdict | null;
  loading: boolean;
  error: string | null;
  emptyText: string;
  /** The checked message, shown as the phone would show it */
  message?: { sender: string; text: string } | undefined;
  children?: ReactNode;
}) {
  if (loading) {
    return (
      <Panel className="flex min-h-72 flex-col items-center justify-center text-center">
        <Spinner className="mb-3 size-5 text-subtle" />
        <p className="text-[15px]">Checking</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Comparing against known Indian scam patterns</p>
      </Panel>
    );
  }
  if (error) {
    return (
      <Panel className="flex min-h-72 flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-3 size-5 stroke-[1.5] text-warning" />
        <p className="max-w-xs text-[15px]">{error}</p>
      </Panel>
    );
  }
  if (!result) {
    return (
      <Panel className="flex min-h-72 flex-col items-center justify-center text-center">
        <p className="max-w-xs text-[15px] text-muted-foreground">{emptyText}</p>
      </Panel>
    );
  }
  return (
    <Panel className={cn("space-y-6", verdictBorder[result.verdict])}>
      {message && <SmsBubble sender={message.sender}>{message.text}</SmsBubble>}
      <div className="text-center">
        <RiskGauge score={result.riskScore} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <VerdictPill verdict={result.verdict} />
          <span className="text-[13px] text-muted-foreground">{result.category}</span>
        </div>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed">{result.summary}</p>
      </div>
      {children}
      {result.redFlags.length > 0 && (
        <div>
          <h3 className="mb-3 text-[13px] text-muted-foreground">Warning signs</h3>
          <ul className="space-y-2">
            {result.redFlags.map((f) => (
              <li key={f} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />
                <span className="min-w-0">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.nextSteps.length > 0 && (
        <div>
          <h3 className="mb-3 text-[13px] text-muted-foreground">What to do</h3>
          <ol className="space-y-2">
            {result.nextSteps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-surface-raised font-mono text-xs text-muted-foreground">{i + 1}</span>
                <span className="min-w-0">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {result.verdict !== "safe" && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Already paid or shared details? Call within the first hour</p>
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
