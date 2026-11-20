import type { SecurityCheck } from "./scam-types";

/** Official domains for brands that scammers commonly imitate in India. */
export const PROTECTED_BRANDS: { name: string; terms: string[]; domains: string[] }[] = [
  { name: "State Bank of India", terms: ["sbi", "onlinesbi", "statebank"], domains: ["onlinesbi.sbi", "sbi.co.in", "sbi.bank.in", "sbicard.com"] },
  { name: "HDFC Bank", terms: ["hdfc", "hdfcbank"], domains: ["hdfcbank.com", "hdfc.com", "hdfcbank.bank.in"] },
  { name: "ICICI Bank", terms: ["icici", "icicibank"], domains: ["icicibank.com", "icici.bank.in"] },
  { name: "Axis Bank", terms: ["axisbank"], domains: ["axisbank.com", "axis.bank.in"] },
  { name: "Kotak Mahindra Bank", terms: ["kotak"], domains: ["kotak.com", "kotak.bank.in"] },
  { name: "Punjab National Bank", terms: ["pnb", "pnbindia"], domains: ["pnbindia.in", "pnb.bank.in"] },
  { name: "Bank of Baroda", terms: ["bankofbaroda"], domains: ["bankofbaroda.in", "bankofbaroda.com"] },
  { name: "Canara Bank", terms: ["canarabank", "canara"], domains: ["canarabank.com", "canarabank.bank.in"] },
  { name: "Yes Bank", terms: ["yesbank"], domains: ["yesbank.in"] },
  { name: "Paytm", terms: ["paytm"], domains: ["paytm.com", "paytmbank.com"] },
  { name: "PhonePe", terms: ["phonepe"], domains: ["phonepe.com"] },
  { name: "Google Pay", terms: ["gpay", "googlepay"], domains: ["google.com", "pay.google.com"] },
  { name: "BHIM / NPCI", terms: ["bhim", "npci", "upi"], domains: ["bhimupi.org.in", "npci.org.in"] },
  { name: "UIDAI (Aadhaar)", terms: ["uidai", "aadhaar", "aadhar"], domains: ["uidai.gov.in", "myaadhaar.uidai.gov.in"] },
  { name: "Income Tax Dept", terms: ["incometax"], domains: ["incometax.gov.in", "incometaxindia.gov.in"] },
  { name: "EPFO", terms: ["epfo", "epfindia"], domains: ["epfindia.gov.in"] },
  { name: "IRCTC", terms: ["irctc"], domains: ["irctc.co.in"] },
  { name: "India Post", terms: ["indiapost"], domains: ["indiapost.gov.in"] },
  { name: "RBI", terms: ["rbi"], domains: ["rbi.org.in"] },
  { name: "Amazon", terms: ["amazon"], domains: ["amazon.in", "amazon.com", "amazonaws.com", "amazonpay.in"] },
  { name: "Flipkart", terms: ["flipkart"], domains: ["flipkart.com"] },
  { name: "Parivahan / e-Challan", terms: ["parivahan", "echallan"], domains: ["parivahan.gov.in", "echallan.parivahan.gov.in"] },
];

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at", "goo.gl", "ow.ly", "tiny.cc", "s.id", "rebrand.ly", "t.ly", "bitly.com"];
const RISKY_TLDS = ["xyz", "top", "club", "online", "site", "live", "icu", "buzz", "shop", "click", "link", "info", "tk", "ml", "ga", "cf", "gq", "rest", "cyou", "sbs", "cfd", "vip", "work", "support", "fun", "monster", "lat"];
const BAIT_WORDS = ["kyc", "verify", "update", "login", "signin", "reward", "refund", "claim", "kbc", "lottery", "gift", "bonus", "blocked", "suspend", "otp", "electricity", "challan", "redeem", "cashback", "secure-", "account-"];
const SECOND_LEVEL = ["co", "gov", "org", "net", "ac", "nic", "edu", "res", "bank", "firm", "gen", "ind"];

export function registrableDomain(hostname: string): string {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  const sld = parts[parts.length - 2] ?? "";
  const tld = parts[parts.length - 1] ?? "";
  if (tld.length === 2 && SECOND_LEVEL.includes(sld)) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

function normalizeLeet(s: string): string {
  return s.replace(/rn/g, "m").replace(/vv/g, "w").replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s").replace(/\$/g, "s").replace(/@/g, "a");
}

export function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0] ?? 0;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j] ?? 0;
      dp[j] = Math.min((dp[j] ?? 0) + 1, (dp[j - 1] ?? 0) + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length] ?? 0;
}

function isOfficial(hostname: string, domains: string[]) {
  return domains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
}

/** Detects whether a hostname belongs to, or imitates, a protected brand. */
export function detectBrand(hostname: string): { name: string; official: boolean; reason?: string } | null {
  const host = hostname.toLowerCase();
  for (const brand of PROTECTED_BRANDS) {
    if (isOfficial(host, brand.domains)) return { name: brand.name, official: true };
  }
  const reg = registrableDomain(host);
  const tokens = host.split(/[.-]/).filter(Boolean);
  const normalizedTokens = tokens.map(normalizeLeet);
  const regLabel = normalizeLeet(reg.split(".")[0] ?? "");
  for (const brand of PROTECTED_BRANDS) {
    for (const term of brand.terms) {
      const short = term.length <= 4;
      const hit = normalizedTokens.some((t) =>
        short ? t === term || (t.startsWith(term) && t.length <= term.length + 8) : t.includes(term),
      );
      if (hit) return { name: brand.name, official: false, reason: `uses "${term}" but is not an official ${brand.name} domain` };
    }
    for (const d of brand.domains) {
      const officialLabel = d.split(".")[0] ?? "";
      if (officialLabel.length >= 6 && regLabel !== officialLabel && levenshtein(regLabel, officialLabel) <= 2) {
        return { name: brand.name, official: false, reason: `"${reg}" is spelled almost like ${d}` };
      }
    }
  }
  return null;
}

export interface UrlAnalysis {
  url: URL;
  hostname: string;
  checks: SecurityCheck[];
  heuristicScore: number;
  brand: ReturnType<typeof detectBrand>;
}

export function normalizeUrlInput(raw: string): URL | null {
  const trimmed = raw.trim().replace(/^hxxp/i, "http").replace(/\[\.\]/g, ".");
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) return null;
    return u;
  } catch {
    return null;
  }
}

/** Offline, deterministic checks on the URL text itself. */
export function analyzeUrl(raw: string): UrlAnalysis | null {
  const url = normalizeUrlInput(raw);
  if (!url) return null;
  const hostname = url.hostname.toLowerCase();
  const checks: SecurityCheck[] = [];
  const add = (c: SecurityCheck) => checks.push(c);
  const rawHasNonAscii = /[^\x00-\x7F]/.test(raw);

  add(
    url.protocol === "https:"
      ? { id: "scheme", label: "Encrypted link (HTTPS)", status: "pass", detail: "The link uses HTTPS." }
      : { id: "scheme", label: "Encrypted link (HTTPS)", status: "warn", detail: "The link uses plain HTTP — anything you type can be read in transit." },
  );

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith("[")) {
    add({ id: "ip", label: "Real domain name", status: "fail", detail: "The link points to a raw IP address instead of a domain — banks never do this." });
  }

  if (hostname.includes("xn--") || rawHasNonAscii) {
    add({ id: "homograph", label: "Look-alike characters", status: "fail", detail: "The domain uses special characters that can imitate a real website (homograph attack)." });
  }

  const brand = detectBrand(hostname);
  if (brand?.official) {
    add({ id: "brand", label: "Look-alike banking site", status: "pass", detail: `Matches an official ${brand.name} domain.` });
  } else if (brand) {
    add({ id: "brand", label: "Look-alike banking site", status: "fail", detail: `Imitates ${brand.name}: ${brand.reason}.` });
  } else {
    add({ id: "brand", label: "Look-alike banking site", status: "pass", detail: "No imitation of a major Indian bank or payment brand found." });
  }

  const reg = registrableDomain(hostname);
  if (SHORTENERS.includes(reg) || SHORTENERS.includes(hostname)) {
    add({ id: "shortener", label: "Hidden destination", status: "warn", detail: "This is a link shortener — the real destination is hidden until you open it." });
  }

  const tld = hostname.split(".").pop() ?? "";
  if (RISKY_TLDS.includes(tld)) {
    add({ id: "tld", label: "Domain ending", status: "warn", detail: `".${tld}" domains are cheap and frequently used for scam sites.` });
  }

  const labels = hostname.split(".");
  if (labels.length >= 5 && !brand?.official) {
    add({ id: "subdomains", label: "Domain structure", status: "warn", detail: "Many stacked subdomains — often used to push the real domain out of view." });
  }

  if ((hostname.match(/-/g) ?? []).length >= 3) {
    add({ id: "hyphens", label: "Domain structure", status: "warn", detail: "Lots of hyphens in the domain, a common pattern in fake sites." });
  }

  if (url.username || raw.includes("@")) {
    add({ id: "userinfo", label: "Disguised address", status: "fail", detail: "The link contains '@', which can hide the real site you will be sent to." });
  }

  if (url.port && !["80", "443"].includes(url.port)) {
    add({ id: "port", label: "Unusual port", status: "warn", detail: `Uses port ${url.port}, which legitimate sites rarely do.` });
  }

  if (/\.apk(\?|$)/i.test(url.pathname + url.search)) {
    add({ id: "apk", label: "App download", status: "fail", detail: "The link downloads an Android app (.apk) — a common way to install SMS/OTP-stealing malware." });
  }

  const haystack = `${hostname}${url.pathname}${url.search}`.toLowerCase();
  const bait = BAIT_WORDS.filter((w) => haystack.includes(w));
  if (bait.length && !brand?.official) {
    add({ id: "bait", label: "Bait words", status: "warn", detail: `Contains pressure words: ${bait.slice(0, 5).map((b) => b.replace(/-$/, "")).join(", ")}.` });
  }

  if (raw.length > 120) {
    add({ id: "length", label: "Link length", status: "warn", detail: "Very long link — scammers pad links to hide the suspicious part." });
  }

  const score = checks.reduce((s, c) => s + (c.status === "fail" ? 30 : c.status === "warn" ? 12 : 0), 0);
  const heuristicScore = Math.min(100, brand?.official ? Math.max(0, score - 20) : score);

  return { url, hostname, checks, heuristicScore, brand };
}

/** Blocks probing of local/private network addresses from the server. */
export function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return h.includes(":");
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}
