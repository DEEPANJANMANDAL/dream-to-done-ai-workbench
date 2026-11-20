import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

export const SCAM_MODEL = "openai/gpt-6.1-sol" as const;

export const SAFETY_CONTEXT = `You are ScamShield, an Indian cyber-fraud analyst. You know common Indian scams: fake KYC/bank SMS, UPI collect-request traps, "digital arrest" by fake CBI/police, TRAI SIM-block calls, electricity disconnection threats, task/part-time job scams, fake stock/IPO advisory groups, APK "wedding invite" malware, fake e-challan links, sextortion, lottery/KBC prizes, customer-care number scams, fake payment screenshots.
Key facts: Banks/UPI apps never ask for OTP, PIN, or CVV. Entering a UPI PIN is only needed to SEND money, never to receive. Police/CBI never arrest over video call. India's cyber fraud helpline is 1930; report at cybercrime.gov.in; report fraud calls/SMS on Sanchar Saathi (Chakshu).
Write in plain, calm language for non-technical people. If the user's content is in Hindi or another Indian language, write summary, redFlags and nextSteps in that language.`;

export const verdictProperties = {
  verdict: { type: "string", enum: ["scam", "suspicious", "safe"] },
  riskScore: { type: "integer", description: "0 (safe) to 100 (certain scam)" },
  category: { type: "string", description: "Short scam type, e.g. 'UPI collect trap', 'Fake KYC', 'Genuine message'" },
  summary: { type: "string", description: "One or two sentences explaining the verdict" },
  redFlags: { type: "array", items: { type: "string" }, description: "Specific warning signs found (empty if none)" },
  nextSteps: { type: "array", items: { type: "string" }, description: "2-4 short, concrete actions" },
} as const;

export const verdictRequired = ["verdict", "riskScore", "category", "summary", "redFlags", "nextSteps"] as const;

type ContentPart = { type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "auto" | "high" | "low" };

export async function runJson<T>(name: string, instructions: string, content: ContentPart[], schema: Record<string, unknown>): Promise<T> {
  const response = await generateResponse({
    model: SCAM_MODEL,
    instructions,
    input: [{ role: "user", content }],
    reasoning: { effort: "low" },
    text: { format: { type: "json_schema", name, strict: true, schema } },
  });
  let text = "";
  for (const item of response.output ?? []) {
    if (item.type === "message") {
      for (const part of item.content ?? []) {
        if (part.type === "output_text") text += part.text;
      }
    }
  }
  if (!text) throw new Error("Empty model response");
  return JSON.parse(text) as T;
}

export function friendlyAiError(error: unknown): string {
  if (error instanceof GatewayError) {
    console.error("AI gateway error", error.code, error.httpStatus, error.ids);
    if (error.httpStatus === 429) return "Too many scans right now — please wait a moment and try again.";
    if (error.httpStatus === 402) return "AI credits have run out for this app. Please try again later.";
    return "The AI analyst is unavailable right now. Please try again.";
  }
  console.error("Scan failed", error);
  return "Something went wrong while analysing. Please try again.";
}

export function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 50)));
}
