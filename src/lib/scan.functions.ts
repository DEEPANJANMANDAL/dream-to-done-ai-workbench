import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { BaseVerdict, ScanResult, ScreenshotScanResult, UrlScanResult } from "./scam-types";
import { analyzeUrl } from "./url-analysis";
import { SAFETY_CONTEXT, clampScore, friendlyAiError, runJson, verdictProperties, verdictRequired } from "./scam-ai.server";
import { probeUrl } from "./url-probe.server";

const verdictSchema = {
  type: "object",
  additionalProperties: false,
  required: [...verdictRequired],
  properties: verdictProperties,
};

function tidy<T extends BaseVerdict>(v: T): T {
  return { ...v, riskScore: clampScore(v.riskScore), redFlags: v.redFlags.slice(0, 8), nextSteps: v.nextSteps.slice(0, 5) };
}

export const scanMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => z.object({ text: z.string().trim().min(3).max(6000) }).parse(input))
  .handler(async ({ data }): Promise<ScanResult<BaseVerdict>> => {
    try {
      const v = await runJson<BaseVerdict>(
        "message_verdict",
        `${SAFETY_CONTEXT}\nClassify the message the user received. Be decisive. Genuine bank alerts that only inform (no links asking for details, no urgency) are safe.`,
        [{ type: "input_text", text: `Message received:\n"""\n${data.text}\n"""` }],
        verdictSchema,
      );
      return { ok: true, result: tidy(v) };
    } catch (e) {
      return { ok: false, error: friendlyAiError(e) };
    }
  });

export const scanUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => z.object({ url: z.string().trim().min(3).max(2000) }).parse(input))
  .handler(async ({ data }): Promise<ScanResult<UrlScanResult>> => {
    const analysis = analyzeUrl(data.url);
    if (!analysis) return { ok: false, error: "That doesn't look like a web link. Try something like example.com/page." };

    const probe = await probeUrl(analysis.url).catch((e) => {
      console.error("probe failed", e);
      return null;
    });
    const checks = [...analysis.checks, ...(probe?.checks ?? [])];
    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;
    const heuristic = Math.min(100, analysis.heuristicScore + (probe?.checks ?? []).reduce((s, c) => s + (c.status === "fail" ? 30 : c.status === "warn" ? 12 : 0), 0));

    const base = {
      inputUrl: data.url,
      finalUrl: probe?.finalUrl ?? analysis.url.toString(),
      hostname: analysis.hostname,
      checks,
      redirects: probe?.redirects ?? [],
    };

    try {
      const ai = await runJson<BaseVerdict & { patterns: { pattern: string; explanation: string }[] }>(
        "url_verdict",
        `${SAFETY_CONTEXT}\nYou review links for phishing. Combine the automated check results with your own knowledge of the domain. Official domains of real banks are safe even if the page has a login form. In "patterns", explain each suspicious part of the URL (domain, subdomain, path, query) in plain words; if the link is clean, explain why it looks legitimate.`,
        [
          {
            type: "input_text",
            text: JSON.stringify({
              url: data.url,
              finalUrl: base.finalUrl,
              redirectChain: base.redirects,
              pageTitle: probe?.pageTitle ?? null,
              asksForPassword: probe?.hasPasswordField ?? false,
              automatedChecks: checks.map(({ label, status, detail }) => ({ label, status, detail })),
              heuristicRiskScore: heuristic,
            }),
          },
        ],
        {
          type: "object",
          additionalProperties: false,
          required: [...verdictRequired, "patterns"],
          properties: {
            ...verdictProperties,
            patterns: {
              type: "array",
              items: { type: "object", additionalProperties: false, required: ["pattern", "explanation"], properties: { pattern: { type: "string" }, explanation: { type: "string" } } },
            },
          },
        },
      );
      return { ok: true, result: { ...tidy(ai), ...base, patterns: ai.patterns.slice(0, 6), aiAvailable: true } };
    } catch (e) {
      friendlyAiError(e);
      const verdict = failCount > 0 ? "scam" : warnCount > 1 ? "suspicious" : "safe";
      return {
        ok: true,
        result: {
          ...base,
          verdict,
          riskScore: heuristic,
          category: verdict === "safe" ? "No obvious red flags" : "Phishing indicators",
          summary: "AI explanation is unavailable right now; this verdict is based on automated checks only.",
          redFlags: checks.filter((c) => c.status === "fail" || c.status === "warn").map((c) => c.detail),
          nextSteps: ["Don't enter passwords, OTPs or card details on this site.", "Open your bank's app directly instead of using links.", "Report fraud at cybercrime.gov.in or call 1930."],
          patterns: [],
          aiAvailable: false,
        },
      };
    }
  });

const MAX_IMAGE_CHARS = 6_000_000;

export const scanScreenshot = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string }) =>
    z
      .object({ image: z.string().max(MAX_IMAGE_CHARS).regex(/^data:image\/(png|jpe?g|webp);base64,/) })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ScanResult<ScreenshotScanResult>> => {
    try {
      const v = await runJson<ScreenshotScanResult>(
        "screenshot_verdict",
        `${SAFETY_CONTEXT}\nThe user uploaded a screenshot (often WhatsApp, SMS, email, or a payment app). First transcribe ALL visible text exactly into extractedText (keep the original language). Identify the source app in "source". Then judge it. Fake payment proofs often show: odd fonts or alignment, missing UTR/transaction ID, wrong bank logos, "pending" disguised as success, or edited amounts. A QR code sent by a stranger to "receive" money is always a scam (scanning a QR only sends money).`,
        [
          { type: "input_text", text: "Analyse this screenshot for scams." },
          { type: "input_image", image_url: data.image, detail: "high" },
        ],
        {
          type: "object",
          additionalProperties: false,
          required: [...verdictRequired, "extractedText", "source", "detected"],
          properties: {
            ...verdictProperties,
            extractedText: { type: "string" },
            source: { type: "string", description: "e.g. WhatsApp chat, SMS, Google Pay receipt, Email" },
            detected: {
              type: "object",
              additionalProperties: false,
              required: ["fakePaymentProof", "qrCode", "paymentRequest", "otpOrPinRequest", "suspiciousLink"],
              properties: {
                fakePaymentProof: { type: "boolean" },
                qrCode: { type: "boolean" },
                paymentRequest: { type: "boolean" },
                otpOrPinRequest: { type: "boolean" },
                suspiciousLink: { type: "boolean" },
              },
            },
          },
        },
      );
      return { ok: true, result: tidy(v) };
    } catch (e) {
      return { ok: false, error: friendlyAiError(e) };
    }
  });
