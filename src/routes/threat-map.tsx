import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BookOpen, Clock, Info, Map as MapIcon, PieChart as PieIcon, TrendingDown, TrendingUp } from "lucide-react";
import { DataBadge, PageIntro, Panel, PanelHeader, formatIN } from "@/components/shield/ui";
import { IndiaTileMap, MapLegend } from "@/components/shield/IndiaTileMap";
import { NationalTrendChart } from "@/components/shield/TrendChart";
import { Donut } from "@/components/shield/Donut";
import { MOTIVES_2023, NCRB_SOURCE, NATIONAL_TOTAL_2023, SCAM_TYPE_ESTIMATE, STATES, estimate2024, growth, type StateRow } from "@/lib/threat-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/threat-map")({
  head: () => ({
    meta: [
      { title: "India Cyber Threat Map — State-wise scam trends | ScamShield" },
      { name: "description", content: "State-wise cyber crime trends across India from NCRB data, common fraud categories and incidents over time — with estimates clearly labelled." },
      { property: "og:title", content: "India Cyber Threat Map — ScamShield" },
      { property: "og:description", content: "State-wise cyber crime trends, fraud categories and incidents over time across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreatMapPage,
});

type Metric = "cases" | "rate" | "estimate";

const METRICS: { id: Metric; label: string; kind: "reported" | "estimated"; get: (s: StateRow) => number; legend: string }[] = [
  { id: "cases", label: "Cases 2023", kind: "reported", get: (s) => s.y2023, legend: "Cyber crime cases registered, 2023" },
  { id: "rate", label: "Rate per lakh", kind: "reported", get: (s) => s.rate2023, legend: "Cases per 1 lakh people, 2023" },
  { id: "estimate", label: "Est. 2024", kind: "estimated", get: estimate2024, legend: "ScamShield projection for 2024" },
];

function ThreatMapPage() {
  const [metricId, setMetricId] = useState<Metric>("cases");
  const [selected, setSelected] = useState<string>("KA");
  const metric = METRICS.find((m) => m.id === metricId)!;
  const state = STATES.find((s) => s.code === selected) ?? STATES[0]!;
  const ranked = [...STATES].sort((a, b) => metric.get(b) - metric.get(a)).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <PageIntro eyebrow="Threat intel · India" title="India Cyber Threat Map" description="Where cyber crime is being reported across India, what kind it is, and how fast it's growing.">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> Data last updated {new Date(NCRB_SOURCE.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </PageIntro>

      <div className="panel mb-4 grid gap-3 p-4 text-xs sm:grid-cols-2">
        <div className="flex gap-3">
          <DataBadge kind="reported" />
          <p className="text-muted-foreground">Official cases registered by police, published by the National Crime Records Bureau. Real counts, but only cases that became FIRs.</p>
        </div>
        <div className="flex gap-3">
          <DataBadge kind="estimated" />
          <p className="text-muted-foreground">ScamShield projections and modelled shares. Useful for direction, not exact numbers — shown with dashed lines and violet labels.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader icon={<MapIcon />} title="State-wise scam trends" subtitle="Tap a state for details" action={<DataBadge kind={metric.kind} />} />
          <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-background/60 p-1">
            {METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetricId(m.id)}
                className={cn("flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", metricId === m.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
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
                    <button type="button" onClick={() => setSelected(s.code)} className={cn("grid w-full grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary", selected === s.code && "bg-secondary")}>
                      <span className="font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block truncate">{s.name}</span>
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-background">
                          <span className="block h-full rounded-full bg-destructive" style={{ width: `${(value / max) * 100}%` }} />
                        </span>
                      </span>
                      <span className="font-mono text-xs">{metricId === "rate" ? value.toFixed(1) : formatIN(value)}</span>
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
          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-info" /> Reported (NCRB)</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-violet" /> Estimated 2024–25</span>
          </div>
        </Panel>
        <Panel>
          <PanelHeader icon={<PieIcon />} title="Why cyber crimes happen (2023)" subtitle="Cases by motive" action={<DataBadge kind="reported" />} />
          <Donut data={MOTIVES_2023} centerValue={`${Math.round(NATIONAL_TOTAL_2023 / 1000)}k`} centerLabel="Cases" />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader icon={<PieIcon />} title="Common fraud categories" subtitle="Share of scam messages people bring to ScamShield" action={<DataBadge kind="estimated" />} />
          <Donut data={SCAM_TYPE_ESTIMATE} centerValue="5" centerLabel="Categories" unit="%" />
        </Panel>
        <Panel>
          <PanelHeader icon={<BookOpen />} title="Sources & timestamps" />
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-border bg-surface-raised p-3">
              <div className="flex flex-wrap items-center gap-2">
                <DataBadge kind="reported" />
                <a href={NCRB_SOURCE.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{NCRB_SOURCE.name}</a>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">State-wise cases 2021–2023, crime rate, national totals 2018–2023 and motives. Published 30 Sep 2025.</p>
            </li>
            <li className="rounded-lg border border-border bg-surface-raised p-3">
              <div className="flex flex-wrap items-center gap-2">
                <DataBadge kind="estimated" />
                <span className="font-medium">ScamShield projection model</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">2024–25 national estimate follows the 2021–23 growth trend. State 2024 estimate = 2023 cases × damped recent growth (capped −15% to +40%). Fraud category shares are modelled from common scam reports.</p>
            </li>
            <li className="flex gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
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
    { year: "2024e", value: estimate2024(s), kind: "estimated" },
  ];
  return (
    <Panel>
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected state</p>
          <h2 className="truncate text-xl font-bold">{s.name}</h2>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", g > 0 ? "bg-destructive/15 text-destructive" : "bg-safe/15 text-safe")}>
          {g > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {g > 0 ? "+" : ""}
          {Math.round(g * 100)}% in 2023
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-raised p-3">
          <p className="text-[11px] text-muted-foreground">Cases 2023</p>
          <p className="font-display text-xl font-bold">{formatIN(s.y2023)}</p>
        </div>
        <div className="rounded-lg bg-surface-raised p-3">
          <p className="text-[11px] text-muted-foreground">Per lakh people</p>
          <p className="font-display text-xl font-bold">{s.rate2023.toFixed(1)}</p>
        </div>
      </div>
      <div className="mt-3 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "var(--secondary)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(v, _n, item) => [Number(v).toLocaleString("en-IN"), (item.payload as { kind: string }).kind === "estimated" ? "Estimated" : "Reported"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.year} fill={d.kind === "estimated" ? "var(--violet)" : "var(--info)"} fillOpacity={d.kind === "estimated" ? 0.55 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Blue bars are reported NCRB cases; the violet bar is an estimate.</p>
    </Panel>
  );
}
