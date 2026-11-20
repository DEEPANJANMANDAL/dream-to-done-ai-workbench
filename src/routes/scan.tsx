import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, Panel } from "@/components/shield/ui";
import { VerdictPanel } from "@/components/shield/VerdictPanel";
import { scanMessage } from "@/lib/scan.functions";
import { addHistory } from "@/lib/history";
import type { BaseVerdict } from "@/lib/scam-types";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): { text?: string } =>
    typeof search["text"] === "string" ? { text: search["text"].slice(0, 6000) } : {},
  head: () => ({
    meta: [
      { title: "Message Scanner — Is this SMS or WhatsApp a scam? | ScamShield" },
      { name: "description", content: "Paste any SMS, WhatsApp forward or UPI request and get an instant AI scam verdict with clear next steps." },
      { property: "og:title", content: "Is this message a scam? — ScamShield" },
      { property: "og:description", content: "Instant AI scam verdicts for SMS, WhatsApp and UPI messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

const SAMPLES = [
  { label: "🏦 Bank KYC", text: "Dear SBI user, your KYC has expired and your account will be blocked today. Update now: http://sbi-kyc-update.online/verify" },
  { label: "💸 UPI trap", text: "Hi, I sent ₹5,000 to your number by mistake. Please accept the collect request I sent on PhonePe and enter your PIN to receive it back." },
  { label: "📱 Task job", text: "Part-time job! Earn ₹3000-₹8000 daily by rating hotels on Google. No experience. WhatsApp HR Neha: wa.me/91XXXXXXXXXX" },
  { label: "✅ Genuine", text: "Your OTP for login to HDFC Bank NetBanking is 482913. Valid for 5 mins. Do not share it with anyone. -HDFC Bank" },
];

function ScanPage() {
  const { text: initial } = Route.useSearch();
  const scan = useServerFn(scanMessage);
  const [text, setText] = useState(initial ?? "");
  const [result, setResult] = useState<BaseVerdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

  async function run(value: string) {
    const v = value.trim();
    if (v.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await scan({ data: { text: v } });
      if (res.ok) {
        setResult(res.result);
        addHistory({ kind: "message", title: v.slice(0, 90), verdict: res.result.verdict, riskScore: res.result.riskScore, category: res.result.category });
      } else setError(res.error);
    } catch {
      setError("Couldn't reach the scanner. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initial && !autoRan.current) {
      autoRan.current = true;
      void run(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <PageIntro eyebrow="Built for India · Any language" title="Is this message a scam?" description="Paste any SMS, WhatsApp forward or UPI request. Get an instant verdict with clear next steps." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel className="h-fit">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(text);
            }}
            className="space-y-3"
          >
            <label htmlFor="msg" className="sr-only">Message</label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 6000))}
              placeholder="Paste the suspicious message here…"
              className="min-h-48 w-full resize-y rounded-lg border border-input bg-background/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Try a sample:</span>
              <span className="font-mono">{text.length.toLocaleString("en-IN")} / 6,000</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" onClick={() => setText(s.text)} className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs transition-colors hover:border-primary">
                  {s.label}
                </button>
              ))}
            </div>
            <Button type="submit" variant="scan" size="lg" className="w-full" disabled={loading || text.trim().length < 3}>
              <ScanLine /> {loading ? "Scanning…" : "Scan message"}
            </Button>
          </form>
        </Panel>
        <VerdictPanel result={result} loading={loading} error={error} emptyText="Your risk verdict will appear here." />
      </div>
    </div>
  );
}
