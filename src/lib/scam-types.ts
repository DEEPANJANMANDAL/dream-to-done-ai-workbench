export type Verdict = "scam" | "suspicious" | "safe";

export interface BaseVerdict {
  verdict: Verdict;
  riskScore: number;
  category: string;
  summary: string;
  redFlags: string[];
  nextSteps: string[];
}

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface SecurityCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface RedirectHop {
  url: string;
  status: number;
}

export interface UrlScanResult extends BaseVerdict {
  inputUrl: string;
  finalUrl: string;
  hostname: string;
  checks: SecurityCheck[];
  redirects: RedirectHop[];
  patterns: { pattern: string; explanation: string }[];
  aiAvailable: boolean;
}

export interface ScreenshotScanResult extends BaseVerdict {
  extractedText: string;
  source: string;
  detected: {
    fakePaymentProof: boolean;
    qrCode: boolean;
    paymentRequest: boolean;
    otpOrPinRequest: boolean;
    suspiciousLink: boolean;
  };
}

export type ScanResult<T> = { ok: true; result: T } | { ok: false; error: string };
