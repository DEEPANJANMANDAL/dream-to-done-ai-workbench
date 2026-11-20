import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { CreditCard, FileText, ImageUp, KeyRound, Link2, QrCode, ScanLine, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, Panel, PanelHeader } from "@/components/shield/ui";
import { VerdictPanel } from "@/components/shield/VerdictPanel";
import { scanScreenshot } from "@/lib/scan.functions";
import { addHistory } from "@/lib/history";
import type { ScreenshotScanResult } from "@/lib/scam-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/screenshot")({
  head: () => ({
    meta: [
      { title: "Screenshot Scam Detector — WhatsApp, fake payments & QR | ScamShield" },
      { name: "description", content: "Upload a WhatsApp, SMS or payment screenshot. We read the text and detect fake payment proofs, scam QR codes and payment requests." },
      { property: "og:title", content: "Screenshot Scam Detector — ScamShield" },
      { property: "og:description", content: "Detect fake payment screenshots, scam QR codes and payment requests from any screenshot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScreenshotPage,
});

const MAX_SIDE = 1600;

async function toDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

const DETECTIONS = [
  { key: "fakePaymentProof", label: "Fake payment proof", icon: CreditCard },
  { key: "qrCode", label: "QR code present", icon: QrCode },
  { key: "paymentRequest", label: "Payment request", icon: Wallet },
  { key: "otpOrPinRequest", label: "Asks for OTP / PIN", icon: KeyRound },
  { key: "suspiciousLink", label: "Suspicious link", icon: Link2 },
] as const;

function ScreenshotPage() {
  const scan = useServerFn(scanScreenshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ScreenshotScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("Please upload a PNG, JPG or WebP screenshot.");
      return;
    }
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      setPreview(await toDataUrl(file));
    } catch {
      setError("Couldn't read that image. Try another screenshot.");
    }
  }

  async function run() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await scan({ data: { image: preview } });
      if (res.ok) {
        setResult(res.result);
        addHistory({ kind: "screenshot", title: `${res.result.source}: ${res.result.extractedText.slice(0, 70)}`, verdict: res.result.verdict, riskScore: res.result.riskScore, category: res.result.category });
      } else setError(res.error);
    } catch {
      setError("Couldn't reach the scanner. The image may be too large — try a smaller screenshot.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <PageIntro eyebrow="Text reading · Fake payments · QR codes" title="Screenshot Scam Detector" description="Upload a WhatsApp chat, SMS or 'payment done' screenshot. We read every word and spot fake payment proofs, scam QR codes and money requests." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
            {preview ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-border bg-background">
                  <img src={preview} alt="Uploaded screenshot preview" className="mx-auto max-h-[420px] w-auto object-contain" />
                  {loading && <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 animate-scan-line bg-gradient-to-b from-transparent via-primary/30 to-transparent" />}
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setResult(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-border bg-background/80 backdrop-blur"
                    aria-label="Remove screenshot"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="truncate text-xs text-muted-foreground">{fileName}</p>
                <Button variant="scan" size="lg" className="w-full" onClick={() => void run()} disabled={loading}>
                  <ScanLine /> {loading ? "Reading screenshot…" : "Analyse screenshot"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void pick(e.dataTransfer.files[0]);
                }}
                className={cn("grid-lines flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors", dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary")}
              >
                <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
                  <ImageUp className="size-6" />
                </span>
                <span className="text-sm font-medium">Tap to upload a screenshot</span>
                <span className="text-xs text-muted-foreground">or drag & drop · PNG, JPG, WebP</span>
              </button>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">Screenshots are analysed and not stored by ScamShield. Crop out personal details if you can.</p>
          </Panel>

          <Panel>
            <PanelHeader icon={<FileText />} title="Text found in screenshot" subtitle={result ? `Source: ${result.source}` : "Read automatically"} />
            {result ? (
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-background/60 p-3 font-mono text-xs leading-relaxed">{result.extractedText || "No readable text found."}</pre>
            ) : (
              <p className="grid-lines rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">Extracted text will appear here.</p>
            )}
          </Panel>
        </div>

        <VerdictPanel result={result} loading={loading} error={error} emptyText="Upload a screenshot to get a verdict.">
          {result && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DETECTIONS.map((d) => {
                const hit = result.detected[d.key];
                return (
                  <div key={d.key} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs", hit ? "border-destructive/40 bg-destructive/10" : "border-border bg-surface-raised text-muted-foreground")}>
                    <d.icon className={cn("size-4 shrink-0", hit ? "text-destructive" : "")} />
                    <span className="min-w-0 flex-1 truncate">{d.label}</span>
                    <span className={cn("font-semibold", hit ? "text-destructive" : "text-safe")}>{hit ? "Yes" : "No"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </VerdictPanel>
      </div>
    </div>
  );
}
