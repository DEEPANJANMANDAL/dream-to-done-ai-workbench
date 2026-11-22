import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BookOpen, Clock, Info, Map as MapIcon, PieChart as PieIcon, TrendingDown, TrendingUp } from "lucide-react";
import { DataBadge, PageIntro, Panel, PanelHeader, formatIN } from "@/components/shield/ui";
import { IndiaTileMap, MapLegend } from "@/components/shield/IndiaTileMap";
import { NationalTrendChart } from "@/components/shield/TrendChart";
import { ShareList } from "@/components/shield/ShareList";
import { MOTIVES_2024, NCRB_SOURCE, SCAM_TYPE_ESTIMATE, STATES, estimateCases, growth, type StateRow } from "@/lib/threat-data";
import { en } from "@/lib/i18n/en";

const tt = (k: string) => (en as Record<string, string>)[k] ?? k;
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/threat-map")({
  head: () => ({
    meta: [
      { title: "Scam map of India, cases by state | ScamShield" },
      { name: "description", content: "State-wise cyber crime cases across India from NCRB data, fraud categories and trends over time, with estimates clearly labelled." },
      { property: "og:title", content: "Scam map of India, cases by state" },
      { property: "og:description", content: "State-wise cyber crime cases across India from NCRB data, fraud categories and trends over time, with estimates clearly labelled." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dream-to-done-ai-workbench.lovable.app/threat-map" },
      { property: "og:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
    ],
  }),
  component: ThreatMapPage,
});

type Metric = "cases" | "rate" | "est2025" | "est2026";

const METRICS: { id: Metric; label: string; kind: "reported" | "estimated"; get: (s: StateRow) => number; legend: string }[] = [
  { id: "cases", label: "2024", kind: "reported", get: (s) => s.y2024, legend: "Cyber crime cases registered, 2024" },
  { id: "rate", label: "Per lakh", kind: "reported", get: (s) => s.rate2024, legend: "Cases per 1 lakh people, 2024" },
  { id: "est2025", label: "2025 est.", kind: "estimated", get: (s) => estimateCases(s, 2025), legend: "ScamShield estimate for 2025" },
  { id: "est2026", label: "2026 est.", kind: "estimated", get: (s) => estimateCases(s, 2026), legend: "ScamShield estimate for 2026" },
];

function ThreatMapPage() {
  const [metricId, setMetricId] = useState<Metric>("cases");
  const [selected, setSelected] = useState<string>("KA");
  const metric = METRICS.find((m) => m.id === metricId)!;
  const state = STATES.find((s) => s.code === selected) ?? STATES[0]!;
  const ranked = [...STATES].sort((a, b) => metric.get(b) - metric.get(a)).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <PageIntro eyebrow="Scam map · India" title="Where scams are reported in India" description="Cyber crime cases by state, what kind they are, and how fast they are growing.">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Clock className="size-4 stroke-[1.5]" /> Data last updated {new Date(NCRB_SOURCE.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </PageIntro>

      <div className="panel mb-4 grid gap-4 p-5 text-[13px] leading-relaxed sm:grid-cols-2">
        <div className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3">
          <DataBadge kind="reported" />
          <p className="text-muted-foreground">Official cases registered by police, published by the National Crime Records Bureau. Real counts, but only cases that became FIRs.</p>
        </div>
        <div className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3">
          <DataBadge kind="estimated" />
          <p className="text-muted-foreground">ScamShield projections for 2025 and 2026 and modelled shares. Useful for direction, not exact numbers. Shown in violet with dashed lines.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader icon={<MapIcon />} title="State-wise scam trends" subtitle="Tap a state for details" action={<DataBadge kind={metric.kind} />} />
          <div className="mb-4 flex flex-wrap gap-1 rounded-[10px] border border-border bg-field p-1">
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetricId(m.id)}
                className={cn("flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors", metricId === m.id ? "bg-surface-raised text-primary shadow-[0_1px_2px_rgba(27,31,18,0.08)]" : "text-muted-foreground hover:text-foreground")}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="mx-auto max-w-xl">
            <IndiaTileMap metric={metric.get} selected={selected} onSelect={setSelected} />
          </div>
          <div className="mt-4">
            <MapLegend label={metric.legend} />
          </div>
        </Panel>

        <div className="space-y-4">
          <StateDetail s={state} />
          <Panel>
            <PanelHeader icon={<TrendingUp />} title={`Top states · ${metric.label}`} action={<DataBadge kind={metric.kind} />} />
            <ol className="space-y-1">
              {ranked.map((s, i) => {
                const value = metric.get(s);
                const max = metric.get(ranked[0]!);
                return (
                  <li key={s.code}>
                    <button type="button" onClick={() => setSelected(s.code)} className={cn("grid w-full grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary", selected === s.code && "bg-secondary")}>
                      <span className="font-mono text-xs text-subtle">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block truncate">{s.name}</span>
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-raised">
                          <span className={cn("block h-full rounded-full", selected === s.code ? "bg-primary" : "bg-subtle/60")} style={{ width: `${(value / max) * 100}%` }} />
                        </span>
                      </span>
                      <span className="font-mono text-[13px] tabular-nums">{metricId === "rate" ? value.toFixed(1) : formatIN(value)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader icon={<TrendingUp />} title="Reported incidents over time · India" subtitle="Cyber crime cases registered nationally" action={<div className="flex gap-1"><DataBadge kind="reported" /><DataBadge kind="estimated" /></div>} />
          <NationalTrendChart height={260} />
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-subtle">
            <span className="flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-primary" /> Reported (NCRB)</span>
            <span className="flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-violet" /> Estimated 2025–26</span>
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon={<PieIcon />} title="Why cyber crimes happen (2024)" subtitle="Cases by motive" action={<DataBadge kind="reported" />} />
          <ShareList data={MOTIVES_2024.map((d) => ({ name: tt(d.key), value: d.value }))} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader icon={<PieIcon />} title="Common fraud categories" subtitle="Share of scam messages people bring to ScamShield" action={<DataBadge kind="estimated" />} />
          <ShareList data={SCAM_TYPE_ESTIMATE.map((d) => ({ name: tt(d.key), value: d.value }))} unit="%" />
        </Panel>
        <Panel>
          <PanelHeader icon={<BookOpen />} title="Sources & timestamps" />
          <ul className="space-y-3 text-sm">
            <li className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex flex-wrap items-center gap-3">
                <DataBadge kind="reported" />
                <a href={NCRB_SOURCE.url} target="_blank" rel="noreferrer" className="font-medium text-link hover:underline">{NCRB_SOURCE.name}</a>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">State-wise cases 2022–2024, crime rate per lakh, national totals 2018–2024 and motives. Published 6 May 2026.</p>
            </li>
            <li className="rounded-xl border border-border bg-surface-raised p-4">
              <div className="flex flex-wrap items-center gap-3">
                <DataBadge kind="estimated" />
                <span className="font-medium">ScamShield projection model</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">2025 and 2026 estimates grow each state's 2024 cases each year by 60% of its 2023→24 change (capped −15% to +40%). The national estimate is the sum of the states. Fraud category shares are modelled from common scam reports.</p>
            </li>
            <li className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 stroke-[1.5]" />
              Many more incidents are reported as complaints on cybercrime.gov.in than become police cases, so real exposure is higher than these counts.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function StateDetail({ s }: { s: StateRow }) {
  const g = growth(s);
  const data = [
    { year: "2021", value: s.y2021, kind: "reported" },
    { year: "2022", value: s.y2022, kind: "reported" },
    { year: "2023", value: s.y2023, kind: "reported" },
    { year: "2024", value: s.y2024, kind: "reported" },
    { year: "2025e", value: estimateCases(s, 2025), kind: "estimated" },
    { year: "2026e", value: estimateCases(s, 2026), kind: "estimated" },
  ];
  return (
    <Panel>
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-muted-foreground">Selected state</p>
          <h2 className="truncate text-xl font-medium">{s.name}</h2>
        </div>
        <span className={cn("inline-flex items-center gap-1 font-mono text-[13px] tabular-nums", g > 0 ? "text-destructive" : "text-safe")}>
          {g > 0 ? <TrendingUp className="size-4 stroke-[1.5]" /> : <TrendingDown className="size-4 stroke-[1.5]" />}
          {g > 0 ? "+" : ""}
          {Math.round(g * 100)}% vs 2023
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface-raised p-4">
          <p className="text-[13px] text-muted-foreground">Cases 2024</p>
          <p className="mt-1 text-2xl font-medium tabular-nums">{formatIN(s.y2024)}</p>
        </div>
        <div className="rounded-xl bg-surface-raised p-4">
          <p className="text-[13px] text-muted-foreground">Per lakh people</p>
          <p className="mt-1 text-2xl font-medium tabular-nums">{s.rate2024.toFixed(1)}</p>
        </div>
      </div>
      <div className="mt-3 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: "var(--subtle)", fontSize: 12, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgb(27 31 18 / 0.05)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(v, _n, item) => [Number(v).toLocaleString("en-IN"), (item.payload as { kind: string }).kind === "estimated" ? "Estimated" : "Reported"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.year} fill={d.year === "2024" ? "var(--lime)" : d.kind === "estimated" ? "var(--violet)" : "var(--chart-1)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">Sage bars are reported NCRB cases, lime marks 2024, violet bars are estimates for 2025 and 2026</p>
    </Panel>
  );
}
