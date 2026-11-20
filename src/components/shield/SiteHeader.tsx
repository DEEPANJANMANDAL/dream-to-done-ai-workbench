import { Link } from "@tanstack/react-router";
import { Phone, ScanLine } from "lucide-react";
import { LogoMark } from "./Logo";
import { Button } from "@/components/ui/button";

const TABS = [
  { to: "/", label: "Command Center", exact: true },
  { to: "/scan", label: "Message Scan", exact: false },
  { to: "/url-scanner", label: "URL Scanner", exact: false },
  { to: "/screenshot", label: "Screenshot", exact: false },
  { to: "/threat-map", label: "Threat Map", exact: false },
  { to: "/assistant", label: "AI Assistant", exact: false },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <LogoMark />
          <span className="truncate font-display text-lg font-bold tracking-tight">ScamShield</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-glow"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button asChild variant="scan" size="sm" className="hidden sm:inline-flex">
            <Link to="/url-scanner">
              <ScanLine /> Deep Scan
            </Link>
          </Button>
          <Button asChild variant="danger" size="sm">
            <a href="tel:1930" aria-label="Call cyber fraud helpline 1930">
              <Phone /> 1930
            </a>
          </Button>
        </div>
      </div>
      <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4 pb-2.5 lg:hidden" aria-label="Main mobile">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>ScamShield gives guidance, not legal advice. Lost money? Call 1930 within the golden hour.</p>
        <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Report at cybercrime.gov.in
        </a>
      </div>
    </footer>
  );
}
