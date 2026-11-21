import { Link } from "@tanstack/react-router";
import { Menu, Phone } from "lucide-react";
import { LogoMark } from "./Logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TABS = [
  { to: "/", label: "Overview", exact: true },
  { to: "/scan", label: "Messages", exact: false },
  { to: "/url-scanner", label: "Links", exact: false },
  { to: "/screenshot", label: "Screenshots", exact: false },
  { to: "/threat-map", label: "Scam map", exact: false },
  { to: "/assistant", label: "Assistant", exact: false },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 lg:gap-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <LogoMark />
          <span className="text-base font-medium">ScamShield</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-surface-raised data-[status=active]:text-foreground data-[status=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button asChild variant="danger" size="sm">
            <a href="tel:1930" aria-label="Call the cyber fraud helpline, 1930">
              <Phone /> 1930
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {TABS.map((t) => (
                <DropdownMenuItem key={t.to} asChild>
                  <Link to={t.to} activeOptions={{ exact: t.exact }} className="data-[status=active]:text-primary">
                    {t.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>ScamShield gives guidance, not legal advice. Lost money? Call 1930 within the first hour</p>
        <a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Report at cybercrime.gov.in
        </a>
      </div>
    </footer>
  );
}
