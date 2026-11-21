import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CheckStatus, Verdict } from "@/lib/scam-types";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("panel min-w-0 p-5 sm:p-6", className)}>{children}</section>;
}

export function PanelHeader({ icon, title, action, subtitle }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-medium text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg]:text-subtle">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle ? <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0">
        <p className="mb-2 font-mono text-xs text-primary">{eyebrow}</p>
        <h1 className="text-[28px] font-medium leading-tight sm:text-[32px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

/** Signature detail: a message quoted the way an Indian phone shows it, with the sender ID in mono. */
export function SmsBubble({ sender, children, className }: { sender: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn("min-w-0", className)}>
      <figcaption className="mb-2 font-mono text-xs text-subtle">{sender}</figcaption>
      <blockquote className="rounded-2xl rounded-tl-md border border-border bg-surface-raised px-4 py-3 text-[15px] leading-relaxed">{children}</blockquote>
    </figure>
  );
}

const verdictText: Record<Verdict, string> = {
  scam: "text-destructive",
  suspicious: "text-warning",
  safe: "text-safe",
};

const verdictLabel: Record<Verdict, string> = { scam: "Scam", suspicious: "Suspicious", safe: "Looks safe" };

export function VerdictPill({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] font-medium", verdictText[verdict], className)}>
      <span className="size-2 rounded-full bg-current" />
      {verdictLabel[verdict]}
    </span>
  );
}

export function riskTone(score: number): "safe" | "warning" | "danger" {
  return score >= 65 ? "danger" : score >= 35 ? "warning" : "safe";
}

const toneText = { safe: "text-safe", warning: "text-warning", danger: "text-destructive" } as const;
const toneStroke = { safe: "stroke-safe", warning: "stroke-warning", danger: "stroke-destructive" } as const;
const toneBg = { safe: "bg-safe", warning: "bg-warning", danger: "bg-destructive" } as const;

export function RiskGauge({ score, label = "Risk score", size = 180 }: { score: number; label?: string; size?: number }) {
  const tone = riskTone(score);
  const r = 70;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 180 112" className="size-full" aria-hidden>
        <path d="M20 95 A70 70 0 0 1 160 95" fill="none" className="stroke-surface-raised" strokeWidth={10} strokeLinecap="round" />
        <path
          d="M20 95 A70 70 0 0 1 160 95"
          fill="none"
          className={cn(toneStroke[tone], "transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]")}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className={cn("text-[32px] font-medium leading-none tabular-nums", toneText[tone])}>{score}%</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const tone = riskTone(score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-raised sm:w-24">
        <div className={cn("h-full rounded-full", toneBg[tone])} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{score}%</span>
    </div>
  );
}

const statusStyle: Record<CheckStatus, { dot: string; label: string }> = {
  pass: { dot: "bg-safe", label: "Pass" },
  warn: { dot: "bg-warning", label: "Caution" },
  fail: { dot: "bg-destructive", label: "Danger" },
  info: { dot: "bg-subtle", label: "Info" },
};

export function StatusTag({ status }: { status: CheckStatus }) {
  const s = statusStyle[status];
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
      <span className={cn("size-2 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/** Matches the chart legend: a solid accent line for reported data, a dashed grey line for estimates. */
export function DataBadge({ kind }: { kind: "reported" | "estimated" }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 font-mono text-xs text-subtle">
      {kind === "reported" ? <span className="h-0.5 w-3 rounded-full bg-primary" /> : <span className="w-3 border-t-2 border-dashed border-violet" />}
      {kind === "reported" ? "Reported" : "Estimated"}
    </span>
  );
}

export function StatCard({ label, value, hint, accent = false }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className="panel min-w-0 p-5">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className={cn("mt-3 text-[28px] font-medium leading-none tabular-nums", accent ? "text-primary" : "text-foreground")}>{value}</p>
      <p className="mt-2 text-[13px] text-subtle">{hint}</p>
    </div>
  );
}

export function formatIN(n: number) {
  return n.toLocaleString("en-IN");
}
