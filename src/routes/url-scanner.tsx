import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowDown, Globe, Link2, ListChecks, Lock, Route as RouteIcon, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageIntro, Panel, PanelHeader, StatusTag } from "@/components/shield/ui";
import { VerdictPanel } from "@/components/shield/VerdictPanel";
import { scanUrl } from "@/lib/scan.functions";
import { addHistory } from "@/lib/history";
import type { UrlScanResult } from "@/lib/scam-types";

export const Route = createFileRoute("/url-scanner")({
  head: () => ({
    meta: [
      { title: "Check a link before you tap it | ScamShield" },
      { name: "description", content: "Check any link for phishing, look-alike bank sites, hidden redirects and certificate problems, explained in plain language." },
      { property: "og:title", content: "Check a link before you tap it" },
      { property: "og:description", content: "Check any link for phishing, look-alike bank sites, hidden redirects and certificate problems, explained in plain language." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dream-to-done-ai-workbench.lovable.app/url-scanner" },
      { property: "og:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
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
      <PageIntro eyebrow="Links · Redirects · Certificates" title="Check a link before you tap it" description="We check the domain, follow every redirect, test the security certificate and flag look-alike banking sites." />

      <Panel>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(url);
          }}
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="flex min-w-0 items-center gap-3 rounded-[10px] border border-input bg-background px-3 transition-colors focus-within:border-link">
            <Link2 className="size-4 shrink-0 stroke-[1.5] text-subtle" />
            <label htmlFor="url" className="sr-only">Link to check</label>
            <input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste the link"
              className="h-11 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-subtle"
            />
          </div>
          <Button type="submit" variant="scan" size="lg" className="disabled:aria-busy:opacity-80" aria-busy={loading} disabled={loading || url.trim().length < 3}>
            {loading ? <Spinner /> : <ScanLine />} {loading ? "Checking the link" : "Check link"}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-muted-foreground">Try</span>
          {SAMPLES.map((s) => (
            <button key={s} type="button" onClick={() => setUrl(s)} className="rounded-lg border border-border bg-surface-raised px-3 py-1 font-mono text-xs transition-colors hover:border-input hover:bg-[#2a2a2d]">
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <VerdictPanel result={result} loading={loading} error={error} emptyText="The verdict for the link appears here">
          {result && (
            <div className="rounded-xl border border-border bg-surface-raised p-4 text-[13px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-4 stroke-[1.5]" /> Domain
              </div>
              <p className="mt-1 break-all font-mono text-sm">{result.hostname}</p>
              {!result.aiAvailable && <p className="mt-2 text-warning">The written explanation is unavailable, so this shows the automated checks only</p>}
            </div>
          )}
        </VerdictPanel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader icon={<ListChecks />} title="Security checks" subtitle="Domain, look-alike, SSL and redirect tests" />
            {result ? (
              <ul className="divide-y divide-border/60">
                {result.checks.map((c, i) => (
                  <li key={`${c.id}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {c.id === "ssl" ? <Lock className="size-4 shrink-0 stroke-[1.5] text-subtle" /> : null}
                        {c.label}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{c.detail}</p>
                    </div>
                    <StatusTag status={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder text="Checks appear after you check a link" />
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={<RouteIcon />} title="Redirect chain" />
            {result && result.redirects.length > 0 ? (
              <ol className="space-y-1">
                {result.redirects.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <div className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-2 rounded-lg bg-surface-raised px-3 py-2">
                      <span className={`font-mono text-xs ${r.status >= 300 && r.status < 400 ? "text-warning" : r.status < 300 ? "text-safe" : "text-destructive"}`}>{r.status}</span>
                      <span className="truncate font-mono text-xs">{r.url}</span>
                    </div>
                    {i < result.redirects.length - 1 && <ArrowDown className="mx-auto my-1 size-4 stroke-[1.5] text-subtle" />}
                  </li>
                ))}
              </ol>
            ) : (
              <Placeholder text={result ? "The site could not be opened, so no redirects were recorded" : "Every hop the link takes is listed here"} />
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={<ListChecks />} title="What each part of the link means" subtitle="Plain-language notes on the domain, path and query" />
            {result && result.patterns.length > 0 ? (
              <ul className="space-y-2">
                {result.patterns.map((p) => (
                  <li key={p.pattern} className="rounded-xl border border-border bg-surface-raised p-4">
                    <code className="break-all font-mono text-[13px] text-foreground">{p.pattern}</code>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.explanation}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Placeholder text="Notes on each part of the link appear here" />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">{text}</p>;
}
