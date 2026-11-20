import { analyzeUrl, isPrivateHost, registrableDomain } from "./url-analysis";
import type { RedirectHop, SecurityCheck } from "./scam-types";

export interface ProbeResult {
  redirects: RedirectHop[];
  finalUrl: string;
  checks: SecurityCheck[];
  pageTitle: string | null;
  hasPasswordField: boolean;
}

const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36 ScamShieldScanner";

/** Follows redirects one hop at a time and inspects the landing page. */
export async function probeUrl(start: URL): Promise<ProbeResult> {
  const redirects: RedirectHop[] = [];
  const checks: SecurityCheck[] = [];
  let current = start;
  let pageTitle: string | null = null;
  let hasPasswordField = false;
  let reached = false;

  for (let hop = 0; hop < 7; hop++) {
    if (isPrivateHost(current.hostname)) {
      checks.push({ id: "private", label: "Destination", status: "fail", detail: "The link points into a private network address." });
      break;
    }
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        headers: { "user-agent": UA, accept: "text/html,*/*" },
        signal: AbortSignal.timeout(6000),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (current.protocol === "https:") {
        checks.push({ id: "ssl", label: "SSL certificate", status: "fail", detail: `Secure connection to ${current.hostname} failed — the certificate may be invalid, expired, or the site is down. (${msg.slice(0, 80)})` });
      } else {
        checks.push({ id: "reach", label: "Site reachable", status: "info", detail: `Could not reach ${current.hostname}. It may be offline or blocking scanners.` });
      }
      break;
    }
    redirects.push({ url: current.toString(), status: res.status });
    if (current.protocol === "https:" && !checks.some((c) => c.id === "ssl")) {
      checks.push({ id: "ssl", label: "SSL certificate", status: "pass", detail: `${current.hostname} presented a valid, trusted certificate.` });
    }
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      try {
        current = new URL(location, current);
      } catch {
        break;
      }
      continue;
    }
    reached = true;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/html")) {
      const html = (await res.text()).slice(0, 300_000);
      const title = html.match(/<title[^>]*>([^<]{0,200})<\/title>/i)?.[1]?.trim();
      pageTitle = title ? title.replace(/\s+/g, " ") : null;
      hasPasswordField = /type\s*=\s*["']?password/i.test(html);
    } else if (/android\.package-archive|octet-stream/.test(type)) {
      checks.push({ id: "download", label: "File download", status: "fail", detail: "The link immediately downloads a file instead of opening a web page." });
      await res.body?.cancel();
    } else {
      await res.body?.cancel();
    }
    break;
  }

  if (start.protocol === "http:" && !checks.some((c) => c.id === "ssl")) {
    const upgraded = current.protocol === "https:";
    checks.push({ id: "ssl", label: "SSL certificate", status: upgraded ? "pass" : "warn", detail: upgraded ? "Site upgrades to a secure HTTPS connection." : "Site does not use a secure HTTPS connection." });
  }

  const hops = Math.max(0, redirects.length - 1);
  const startDomain = registrableDomain(start.hostname);
  const endDomain = registrableDomain(current.hostname);
  if (hops === 0 && reached) {
    checks.push({ id: "redirects", label: "Redirects", status: "pass", detail: "No redirects — the link opens directly." });
  } else if (hops > 0) {
    const crossDomain = startDomain !== endDomain;
    checks.push({
      id: "redirects",
      label: "Redirects",
      status: crossDomain ? (hops >= 3 ? "fail" : "warn") : "pass",
      detail: crossDomain ? `Redirects ${hops}× and lands on a different domain: ${endDomain}.` : `Redirects ${hops}× within the same site.`,
    });
    if (crossDomain) {
      const finalAnalysis = analyzeUrl(current.toString());
      const brandCheck = finalAnalysis?.checks.find((c) => c.id === "brand" && c.status === "fail");
      if (brandCheck) checks.push({ ...brandCheck, id: "final-brand", label: "Final page imitates a brand" });
    }
  }

  if (hasPasswordField) {
    const finalAnalysis = analyzeUrl(current.toString());
    const official = finalAnalysis?.brand?.official;
    checks.push({
      id: "login-form",
      label: "Asks for passwords",
      status: official ? "info" : "warn",
      detail: official ? "The page has a login form on an official domain." : "The landing page asks for a password or PIN on a domain that is not an official bank.",
    });
  }

  return { redirects, finalUrl: current.toString(), checks, pageTitle, hasPasswordField };
}
