import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CheckStatus, Verdict } from "@/lib/scam-types";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("panel min-w-0 p-4 sm:p-5", className)}>{children}</section>;
}

export function PanelHeader({ icon, title, action, subtitle }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="mb-6 grid gap-4 sm:mb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="min-w-0">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-safe" />
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {children}
    </div>
  );
}

const verdictStyle: Record<Verdict, string> = {
  scam: "bg-destructive/15 text-destructive border-destructive/30",
  suspicious: "bg-warning/15 text-warning border-warning/30",
  safe: "bg-safe/15 text-safe border-safe/30",
};

const verdictLabel: Record<Verdict, string> = { scam: "Scam", suspicious: "Suspicious", safe: "Looks safe" };

export function VerdictPill({ verdict, className }: { verdict: Verdict; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold", verdictStyle[verdict], className)}>
      <span className="size-1.5 rounded-full bg-current" />
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
        <path d="M20 95 A70 70 0 0 1 160 95" fill="none" className="stroke-secondary" strokeWidth={14} strokeLinecap="round" />
        <path
          d="M20 95 A70 70 0 0 1 160 95"
          fill="none"
          className={cn(toneStroke[tone], "transition-[stroke-dashoffset] duration-700")}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className={cn("font-display text-3xl font-bold leading-none", toneText[tone])}>{score}%</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const tone = riskTone(score);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary sm:w-24">
        <div className={cn("h-full rounded-full", toneBg[tone])} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs text-muted-foreground">{score}%</span>
    </div>
  );
}

const statusStyle: Record<CheckStatus, { dot: string; text: string; label: string }> = {
  pass: { dot: "bg-safe", text: "text-safe", label: "Pass" },
  warn: { dot: "bg-warning", text: "text-warning", label: "Caution" },
  fail: { dot: "bg-destructive", text: "text-destructive", label: "Danger" },
  info: { dot: "bg-info", text: "text-info", label: "Info" },
};

export function StatusTag({ status }: { status: CheckStatus }) {
  const s = statusStyle[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide", s.text)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function DataBadge({ kind }: { kind: "reported" | "estimated" }) {
  return kind === "reported" ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-info/30 bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">
      Reported
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-dashed border-violet/50 bg-violet/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet">
      Estimated
    </span>
  );
}

export function StatCard({ label, value, hint, icon, tone = "default" }: { label: string; value: string; hint: string; icon?: ReactNode; tone?: "default" | "warning" | "danger" | "safe" }) {
  const valueTone = { default: "text-foreground", warning: "text-warning", danger: "text-destructive", safe: "text-safe" }[tone];
  return (
    <div className="panel min-w-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <span className="shrink-0 text-muted-foreground [&_svg]:size-4">{icon}</span>
      </div>
      <p className={cn("mt-2 truncate font-display text-2xl font-bold", valueTone)}>{value}</p>
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function formatIN(n: number) {
  return n.toLocaleString("en-IN");
}
