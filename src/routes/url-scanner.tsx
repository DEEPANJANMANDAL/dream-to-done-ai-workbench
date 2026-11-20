import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowDown, Globe, Link2, ListChecks, Lock, Route as RouteIcon, ScanLine, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, Panel, PanelHeader, StatusTag } from "@/components/shield/ui";
import { VerdictPanel } from "@/components/shield/VerdictPanel";
import { scanUrl } from "@/lib/scan.functions";
import { addHistory } from "@/lib/history";
import type { UrlScanResult } from "@/lib/scam-types";

export const Route = createFileRoute("/url-scanner")({
  head: () => ({
    meta: [
      { title: "Advanced URL Scanner — Check phishing links | ScamShield" },
      { name: "description", content: "Check any link for phishing, look-alike bank sites, hidden redirects and SSL problems — with plain-language explanations." },
      { property: "og:title", content: "Advanced URL Scanner — ScamShield" },
      { property: "og:description", content: "Detect phishing sites, look-alike banking domains, redirects and SSL issues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UrlScannerPage,
});

const SAMPLES = ["sbi-kyc-update.online/verify", "bit.ly/3xYzAbc", "https://www.onlinesbi.sbi", "hdfcbnak-netbanking.top/login"];

function UrlScannerPage() {
  const scan = useServerFn(scanUrl);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(value: string) {
    const v = value.trim();
    if (v.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await scan({ data: { url: v } });
      if (res.ok) {
        setResult(res.result);
        addHistory({ kind: "url", title: v.slice(0, 90), verdict: res.result.verdict, riskScore: res.result.riskScore, category: res.result.category });
      } else setError(res.error);
    } catch {
      setError("Couldn't reach the scanner. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <PageIntro eyebrow="Phishing · Redirects · SSL" title="Advanced URL Scanner" description="Paste a link before you tap it. We check the domain, follow every redirect, test the security certificate and flag look-alike banking sites." />

      <Panel>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(url);
          }}
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 focus-within:border-primary">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <label htmlFor="url" className="sr-only">Link to check</label>
            <input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste a suspicious link, e.g. sbi-reward.xyz/claim"
              className="h-11 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" variant="scan" size="lg" disabled={loading || url.trim().length < 3}>
            <ScanLine /> {loading ? "Scanning…" : "Scan link"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Try:</span>
          {SAMPLES.map((s) => (
            <button key={s} type="button" onClick={() => setUrl(s)} className="rounded-full border border-border bg-surface-raised px-2.5 py-1 font-mono text-[11px] transition-colors hover:border-primary">
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <VerdictPanel result={result} loading={loading} error={error} emptyText="Your link verdict will appear here.">
          {result && (
            <div className="rounded-lg border border-border bg-surface-raised p-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-3.5" /> Domain
              </div>
              <p className="mt-1 break-all font-mono text-sm">{result.hostname}</p>
              {!result.aiAvailable && <p className="mt-2 text-warning">AI explanation unavailable — showing automated checks only.</p>}
            </div>
          )}
        </VerdictPanel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader icon={<ListChecks />} title="Security checks" subtitle="Domain, look-alike, SSL and redirect tests" />
            {result ? (
              <ul className="divide-y divide-border/60">
                {result.checks.map((c, i) => (
                  <li key={`${c.id}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {c.id === "ssl" ? <Lock className="size-3.5 shrink-0 text-muted-foreground" /> : null}
                        {c.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                    <StatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder text="Checks appear after a scan." />
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={<RouteIcon />} title="Redirect chain" />
            {result && result.redirects.length > 0 ? (
              <ol className="space-y-1">
                {result.redirects.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-md bg-surface-raised px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${r.status >= 300 && r.status < 400 ? "bg-warning/15 text-warning" : r.status < 300 ? "bg-safe/15 text-safe" : "bg-destructive/15 text-destructive"}`}>{r.status}</span>
                      <span className="truncate font-mono text-xs">{r.url}</span>
                    </div>
                    {i < result.redirects.length - 1 && <ArrowDown className="mx-auto my-0.5 size-3 text-muted-foreground" />}
                  </li>
                ))}
              </ol>
            ) : (
              <Placeholder text={result ? "The site could not be opened, so no redirects were recorded." : "Every hop the link takes will be listed here."} />
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={<Sparkle />} title="Why this URL looks the way it does" subtitle="AI explanation of suspicious patterns" />
            {result && result.patterns.length > 0 ? (
              <ul className="space-y-2">
                {result.patterns.map((p) => (
                  <li key={p.pattern} className="rounded-lg border border-border bg-surface-raised p-3">
                    <code className="break-all font-mono text-xs text-primary">{p.pattern}</code>
                    <p className="mt-1 text-sm text-muted-foreground">{p.explanation}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder text="Plain-language notes on each part of the link appear here." />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <p className="grid-lines rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">{text}</p>;
}
