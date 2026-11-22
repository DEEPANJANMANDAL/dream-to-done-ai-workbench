import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Bot, ChevronRight, FileText, Image as ImageIcon, Link2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataBadge, Panel, PanelHeader, SmsBubble, StatCard, formatIN } from "@/components/shield/ui";
import { NationalTrendChart } from "@/components/shield/TrendChart";
import { IndiaTileMap, MapLegend } from "@/components/shield/IndiaTileMap";
import { ShareList } from "@/components/shield/ShareList";
import { RecentScans } from "@/components/shield/RecentScans";
import { useHistory } from "@/lib/history";
import { NATIONAL_TOTAL_2023, NATIONAL_TOTAL_2024, SCAM_TYPE_ESTIMATE, STATES, TRENDING_SCAMS, nationalEstimate } from "@/lib/threat-data";
import { en } from "@/lib/i18n/en";

const tt = (k: string) => (en as Record<string, string>)[k] ?? k;
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScamShield — Check messages, links and screenshots for scams in India" },
      { name: "description", content: "Paste an SMS or WhatsApp message to see if it's a scam, check links and screenshots, and see which scams are reaching people in India this week." },
      { property: "og:title", content: "ScamShield — Check messages, links and screenshots for scams in India" },
      { property: "og:description", content: "Paste an SMS or WhatsApp message to see if it's a scam, check links and screenshots, and see which scams are reaching people in India this week." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dream-to-done-ai-workbench.lovable.app/" },
      { property: "og:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/url-scanner", label: "Link", icon: Link2, color: "text-link" },
  { to: "/screenshot", label: "Screenshot", icon: ImageIcon, color: "text-lime-strong" },
  { to: "/assistant", label: "Ask a question", icon: Bot, color: "text-violet" },
] as const;

function Dashboard() {
  const history = useHistory();
  const caught = history.filter((h) => h.verdict !== "safe").length;
  const growthPct = Math.round(((NATIONAL_TOTAL_2024 - NATIONAL_TOTAL_2023) / NATIONAL_TOTAL_2023) * 1000) / 10;
  const top = [...STATES].sort((a, b) => b.y2024 - a.y2024).slice(0, 3);
  const lead = TRENDING_SCAMS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <a href="#trending" className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm transition-colors hover:bg-field">
        <span className="size-2 shrink-0 rounded-full bg-destructive" />
        <span className="shrink-0 text-muted-foreground">Trending now</span>
        <span className="min-w-0 truncate">
          <span className="font-medium">{tt(`${lead.key}.title`)}</span>
          <span className="hidden text-muted-foreground sm:inline"> · {tt(`${lead.key}.desc`)}</span>
        </span>
        <ChevronRight className="ml-auto size-4 shrink-0 stroke-[1.5] text-subtle transition-transform group-hover:translate-x-0.5" />
      </a>

      <div className="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <div className="min-w-0">
          <h1 className="text-[36px] font-medium leading-[1.08] sm:text-[48px]">Is this message a scam?</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">Paste any SMS or WhatsApp message to check it in seconds, then see which scams are reaching people across India this week.</p>
        </div>
        <QuickScan />
      </div>

      <div className={`mt-8 grid gap-4 sm:grid-cols-2 ${history.length > 0 ? "lg:grid-cols-4" : ""}`}>
        <StatCard label="Cyber crimes registered in 2024" value={formatIN(NATIONAL_TOTAL_2024)} hint={`+${growthPct}% vs 2023 · NCRB`} accent />
        <StatCard label="Share of cases that are fraud" value="73%" hint="Of all cyber crime cases, 2024 · NCRB" />
        {history.length > 0 && (
          <>
            <StatCard label="Your checks" value={String(history.length)} hint="Saved on this device" />
            <StatCard label="Scams you caught" value={String(caught)} hint="Scam or suspicious verdicts" />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Cyber crime cases in India"
            subtitle="Registered cases per year, with estimates for 2025 and 2026"
            action={
              <div className="flex gap-4">
                <DataBadge kind="reported" />
                <DataBadge kind="estimated" />
              </div>
            }
          />
          <NationalTrendChart height={280} />
          <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            Registered cyber crimes grew {growthPct}% in 2024 and passed 1 lakh for the first time. At the current pace they could reach about {formatIN(nationalEstimate(2026))} in 2026. The dashed line is an estimate, not reported data
          </p>
        </Panel>

        <Panel>
          <PanelHeader
            title="Scam map"
            action={
              <Link to="/threat-map" className="inline-flex items-center gap-1 rounded-lg bg-map px-3 py-1.5 text-[13px] font-medium text-map-foreground transition-colors hover:bg-map/90">
                Open map <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <IndiaTileMap metric={(s) => s.y2024} compact />
          <div className="mt-4 space-y-3">
            <MapLegend label="Cases, 2024" />
            <ol className="space-y-2 border-t border-border pt-3">
              {top.map((s, i) => (
                <li key={s.code} className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-baseline gap-2 text-sm">
                  <span className="font-mono text-xs text-subtle">{i + 1}</span>
                  <span className="truncate">{s.name}</span>
                  <span className="font-mono text-[13px] tabular-nums text-muted-foreground">{formatIN(s.y2024)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader title="Recent checks" subtitle="Only stored in this browser" />
          <RecentScans />
        </Panel>
        <Panel>
          <PanelHeader title="Scam types we see" action={<DataBadge kind="estimated" />} />
          <ShareList data={SCAM_TYPE_ESTIMATE.map((d) => ({ name: tt(d.key), value: d.value }))} unit="%" />
        </Panel>
      </div>

      <section id="trending" className="mt-16 scroll-mt-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1 text-xl font-medium">Trending this week</h2>
            <p className="text-sm text-muted-foreground">Scams people across India are reporting right now</p>
          </div>
          <Link to="/alerts" className="text-sm text-link hover:underline">
            Seen a new one? Warn others in Scam alerts
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_SCAMS.map((t) => (
            <article key={t.key} className="panel p-5">
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className={cn("size-2 rounded-full", t.level === "rising" ? "bg-lime-strong" : "bg-destructive")} />
                {tt(`level.${t.level}`)}
              </p>
              <h3 className="mt-3 text-base font-medium">{tt(`${t.key}.title`)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tt(`${t.key}.desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 lg:grid-cols-2">
        <SpotTheScam />
        <div className="panel flex flex-col justify-between gap-6 p-6">
          <div>
            <h2 className="text-xl font-medium">Lost money? Act within the first hour</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Report within the golden hour to give your bank the best chance of freezing the money before it moves.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="danger" size="lg">
              <a href="tel:1930">
                <Phone /> Call 1930
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer">
                cybercrime.gov.in <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickScan() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  return (
    <Panel className="flex flex-col">
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length >= 3) navigate({ to: "/scan", search: { text: text.trim() } });
        }}
      >
        <label htmlFor="quick-msg" className="text-[13px] text-muted-foreground">
          Message to check
        </label>
        <textarea
          id="quick-msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the SMS or WhatsApp message"
          className="min-h-32 resize-none rounded-[10px] border border-input bg-field p-4 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-subtle focus:border-link"
        />
        <Button type="submit" variant="scan" size="lg" disabled={text.trim().length < 3}>
          <FileText /> Check message
        </Button>
      </form>
      <div className="mt-4 grid gap-1 border-t border-border pt-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
            <t.icon className={cn("size-4 shrink-0 stroke-[1.5]", t.color)} />
            <span className="truncate">{t.label}</span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

const QUIZ = [
  { sender: "+91 82503 XXXXX", text: "Dear customer, your electricity connection will be disconnected tonight at 9:30 PM. Call officer 8250XXXXXX immediately.", scam: true, why: "Power companies never threaten same-night cuts over SMS with a personal mobile number." },
  { sender: "AX-HDFCBK", text: "Rs.2,500.00 debited from A/c XX4521 on 14-Nov by UPI to SWIGGY. Not you? Call 1800-XXX-XXXX (on back of your card).", scam: false, why: "An information-only alert that points you to the number on your card, with no link or request." },
  { sender: "+91 70214 XXXXX", text: "Congratulations! You are selected for part-time job. Earn ₹5000/day liking YouTube videos. Contact on Telegram @hr_priya.", scam: true, why: "A classic task scam. Small payouts come first, then you're asked to 'invest' to unlock your earnings." },
];

function SpotTheScam() {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const q = QUIZ[i % QUIZ.length]!;
  const correct = answer !== null && answer === q.scam;
  return (
    <div className="panel p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-medium">Spot the scam</h2>
        <span className="font-mono text-xs text-subtle">
          {(i % QUIZ.length) + 1} / {QUIZ.length}
        </span>
      </div>
      <SmsBubble sender={q.sender} className="mt-4">
        {q.text}
      </SmsBubble>
      {answer === null ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={() => setAnswer(true)}>
            Scam
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setAnswer(false)}>
            Genuine
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className={cn("flex items-center gap-2 text-[15px] font-medium", correct ? "text-safe" : "text-destructive")}>
            <span className="size-2 rounded-full bg-current" />
            {correct ? "Correct" : "Not quite"}, it's {q.scam ? "a scam" : "genuine"}
          </p>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{q.why}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setI((n) => n + 1);
              setAnswer(null);
            }}
          >
            Next message
          </Button>
        </div>
      )}
    </div>
  );
}
