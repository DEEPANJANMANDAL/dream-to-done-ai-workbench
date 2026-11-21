import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
      { title: "Is this message a scam? Check an SMS or WhatsApp | ScamShield" },
      { name: "description", content: "Paste any SMS, WhatsApp forward or UPI request to get a scam verdict, the warning signs and clear next steps." },
      { property: "og:title", content: "Is this message a scam? Check an SMS or WhatsApp" },
      { property: "og:description", content: "Paste any SMS, WhatsApp forward or UPI request to get a scam verdict, the warning signs and clear next steps." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dream-to-done-ai-workbench.lovable.app/scan" },
      { property: "og:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
    ],
  }),
  component: ScanPage,
});

const SAMPLES = [
  { label: "Bank KYC", sender: "VM-SBIKYC", text: "Dear SBI user, your KYC has expired and your account will be blocked today. Update now: http://sbi-kyc-update.online/verify" },
  { label: "UPI collect trap", sender: "+91 93321 XXXXX", text: "Hi, I sent ₹5,000 to your number by mistake. Please accept the collect request I sent on PhonePe and enter your PIN to receive it back." },
  { label: "Task job", sender: "+91 70214 XXXXX", text: "Part-time job! Earn ₹3000-₹8000 daily by rating hotels on Google. No experience. WhatsApp HR Neha: wa.me/91XXXXXXXXXX" },
  { label: "Genuine OTP", sender: "AX-HDFCBK", text: "Your OTP for login to HDFC Bank NetBanking is 482913. Valid for 5 mins. Do not share it with anyone. -HDFC Bank" },
];

function ScanPage() {
  const { text: initial } = Route.useSearch();
  const scan = useServerFn(scanMessage);
  const [text, setText] = useState(initial ?? "");
  const [result, setResult] = useState<BaseVerdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sender, setSender] = useState("Pasted message");
  const [checked, setChecked] = useState<{ sender: string; text: string } | null>(null);
  const autoRan = useRef(false);

  async function run(value: string) {
    const v = value.trim();
    if (v.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setChecked({ sender, text: v });
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
      <PageIntro eyebrow="Messages · Any Indian language" title="Is this message a scam?" description="Paste any SMS, WhatsApp forward or UPI request to get a verdict and clear next steps." />
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
              onChange={(e) => {
                setText(e.target.value.slice(0, 6000));
                setSender("Pasted message");
              }}
              placeholder="Paste the message"
              className="min-h-48 w-full resize-y rounded-[10px] border border-input bg-field p-4 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-subtle focus:border-link"
            />
            <div className="flex items-center justify-between text-[13px] text-muted-foreground">
              <span>Try a sample</span>
              <span className="font-mono text-xs tabular-nums text-subtle">{text.length.toLocaleString("en-IN")} / 6,000</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" onClick={() => {
                    setText(s.text);
                    setSender(s.sender);
                  }}
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-[13px] transition-colors hover:border-input hover:bg-[#dcdfc8]">
                  {s.label}
                </button>
              ))}
            </div>
            <Button type="submit" variant="scan" size="lg" className="w-full disabled:aria-busy:opacity-80" aria-busy={loading} disabled={loading || text.trim().length < 3}>
              {loading ? <Spinner /> : <ScanLine />} {loading ? "Checking the message" : "Check message"}
            </Button>
          </form>
        </Panel>
        <VerdictPanel result={result} loading={loading} error={error} emptyText="The verdict appears here, with the warning signs and what to do next" message={checked ?? undefined} />
      </div>
    </div>
  );
}
