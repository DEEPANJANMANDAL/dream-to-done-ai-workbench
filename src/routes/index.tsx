import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ArrowRight, Bot, FileText, Flame, Gauge, Image as ImageIcon, Link2, Map as MapIcon, Phone, ScanLine, ShieldAlert, Siren, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataBadge, Panel, PanelHeader, StatCard, formatIN } from "@/components/shield/ui";
import { NationalTrendChart } from "@/components/shield/TrendChart";
import { IndiaTileMap, MapLegend } from "@/components/shield/IndiaTileMap";
import { Donut } from "@/components/shield/Donut";
import { RecentScans } from "@/components/shield/RecentScans";
import { useHistory } from "@/lib/history";
import { NATIONAL_TOTAL_2022, NATIONAL_TOTAL_2023, SCAM_TYPE_ESTIMATE, STATES, TRENDING_SCAMS } from "@/lib/threat-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScamShield Command Center — India scam & cyber threat dashboard" },
      { name: "description", content: "One dashboard to scan messages, links and screenshots for scams and track India's cyber crime trends." },
      { property: "og:title", content: "ScamShield Command Center" },
      { property: "og:description", content: "Scan messages, links and screenshots for scams and track India's cyber threats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/scan", label: "Message scan", desc: "SMS, WhatsApp, UPI", icon: FileText },
  { to: "/url-scanner", label: "URL scanner", desc: "Phishing & look-alikes", icon: Link2 },
  { to: "/screenshot", label: "Screenshot", desc: "Fake payments, QR", icon: ImageIcon },
  { to: "/assistant", label: "AI assistant", desc: "Ask anything", icon: Bot },
] as const;

function Dashboard() {
  const history = useHistory();
  const caught = history.filter((h) => h.verdict !== "safe").length;
  const growthPct = Math.round(((NATIONAL_TOTAL_2023 - NATIONAL_TOTAL_2022) / NATIONAL_TOTAL_2022) * 1000) / 10;
  const top = [...STATES].sort((a, b) => b.y2023 - a.y2023).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <Ticker />

      <div className="mb-6 mt-6 grid gap-3 sm:mb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Is this message a scam? Check it here — and see what's targeting India right now.</p>
        </div>
        <Button asChild variant="scan" className="w-full sm:w-auto">
          <Link to="/scan">
            <ScanLine /> Scan a message
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="National threat level" value="Elevated" hint="Fraud drives ~69% of cyber cases" icon={<Siren />} tone="warning" />
        <StatCard label="Cyber crimes registered (2023)" value={formatIN(NATIONAL_TOTAL_2023)} hint={`↑ ${growthPct}% vs 2022 · NCRB`} icon={<ShieldAlert />} tone="danger" />
        <StatCard label="Your scans" value={String(history.length)} hint="Saved on this device" icon={<Activity />} />
        <StatCard label="Threats you caught" value={String(caught)} hint="Scam or suspicious verdicts" icon={<Gauge />} tone="safe" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <QuickScan />

        <Panel>
          <PanelHeader icon={<TrendingUp />} title="Cyber crime trend modeling" action={<div className="flex gap-1"><DataBadge kind="reported" /><DataBadge kind="estimated" /></div>} />
          <NationalTrendChart height={190} />
          <div className="mt-3 rounded-lg border border-violet/30 bg-violet/10 p-3 text-xs leading-relaxed">
            <span className="font-semibold text-violet">AI analyst:</span> Registered cyber crimes grew {growthPct}% in 2023. If that pace continues, cases could pass 1 lakh in 2024 — the dashed line is a projection, not reported data.
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            icon={<MapIcon />}
            title="Live topography"
            action={
              <Link to="/threat-map" className="text-xs font-medium text-primary hover:underline">
                Open map
              </Link>
            }
          />
          <IndiaTileMap metric={(s) => s.y2023} compact />
          <div className="mt-3 space-y-2">
            <MapLegend label="2023 reported cases" />
            <div className="flex flex-wrap gap-1.5">
              {top.map((s) => (
                <span key={s.code} className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px]">
                  {s.name} · {formatIN(s.y2023)}
                </span>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader icon={<Activity />} title="Recent scans" subtitle="Only stored in this browser" />
          <RecentScans />
        </Panel>
        <Panel>
          <PanelHeader icon={<ShieldAlert />} title="Scam types we see" action={<DataBadge kind="estimated" />} />
          <Donut data={SCAM_TYPE_ESTIMATE} centerValue="5" centerLabel="Top types" unit="%" />
        </Panel>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Flame className="size-5 text-warning" /> Trending this week
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_SCAMS.map((t) => (
            <article key={t.title} className="panel p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden>{t.emoji}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", t.level === "Rising" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive")}>{t.level}</span>
              </div>
              <h3 className="mt-2 font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <SpotTheScam />
        <div className="panel flex flex-col justify-between gap-4 border-destructive/40 p-5">
          <div>
            <h2 className="text-lg font-bold">Lost money? Act in the golden hour</h2>
            <p className="mt-1 text-sm text-muted-foreground">Report within the first hour to maximise the chance of freezing the funds.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="danger">
              <a href="tel:1930">
                <Phone /> Call 1930
              </a>
            </Button>
            <Button asChild variant="outline">
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

function Ticker() {
  const items = [...TRENDING_SCAMS, ...TRENDING_SCAMS];
  return (
    <div className="panel relative overflow-hidden py-2" aria-label="Trending scams">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap px-4 text-xs">
        {items.map((t, i) => (
          <span key={`${t.title}-${i}`} className="text-muted-foreground">
            <span aria-hidden>{t.emoji}</span> <span className="font-semibold text-foreground">{t.title}</span> — {t.desc}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuickScan() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  return (
    <Panel className="flex flex-col">
      <PanelHeader icon={<ScanLine />} title="Quick scan" action={<span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">AI</span>} />
      <form
        className="flex flex-1 flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length >= 3) navigate({ to: "/scan", search: { text: text.trim() } });
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a suspicious SMS or WhatsApp message…"
          className="min-h-24 flex-1 resize-none rounded-lg border border-input bg-background/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <Button type="submit" variant="scan" disabled={text.trim().length < 3}>
          Check message
        </Button>
      </form>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-raised p-2.5 transition-colors hover:border-primary">
            <t.icon className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{t.label}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{t.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

const QUIZ = [
  { text: "Dear customer, your electricity connection will be disconnected tonight at 9:30 PM. Call officer 8250XXXXXX immediately.", scam: true, why: "Power companies never threaten same-night cuts over SMS with a personal mobile number." },
  { text: "Rs.2,500.00 debited from A/c XX4521 on 14-Nov by UPI to SWIGGY. Not you? Call 1800-XXX-XXXX (on back of your card).", scam: false, why: "An information-only alert that points you to the number on your card, with no link or request." },
  { text: "Congratulations! You are selected for part-time job. Earn ₹5000/day liking YouTube videos. Contact on Telegram @hr_priya.", scam: true, why: "Classic task scam — small payouts first, then you're asked to 'invest' to unlock earnings." },
];

function SpotTheScam() {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const q = QUIZ[i % QUIZ.length]!;
  const correct = answer !== null && answer === q.scam;
  return (
    <div className="panel p-5">
      <h2 className="text-lg font-bold">Spot the scam</h2>
      <blockquote className="mt-3 rounded-lg border-l-2 border-primary bg-surface-raised p-3 text-sm italic">"{q.text}"</blockquote>
      {answer === null ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="danger" onClick={() => setAnswer(true)}>Scam</Button>
          <Button variant="outline" onClick={() => setAnswer(false)}>Genuine</Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className={cn("text-sm font-semibold", correct ? "text-safe" : "text-destructive")}>{correct ? "Correct!" : "Not quite."} It's {q.scam ? "a scam" : "genuine"}.</p>
          <p className="text-sm text-muted-foreground">{q.why}</p>
          <Button variant="secondary" size="sm" onClick={() => { setI((n) => n + 1); setAnswer(null); }}>
            Next message
          </Button>
        </div>
      )}
    </div>
  );
}
