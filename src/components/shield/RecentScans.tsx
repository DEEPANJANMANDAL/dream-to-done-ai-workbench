import { Link } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useHistory, type ScanKind } from "@/lib/history";
import { ScoreBar, VerdictPill } from "./ui";

const kindMeta: Record<ScanKind, { label: string; icon: typeof FileText }> = {
  message: { label: "Message", icon: FileText },
  url: { label: "Link", icon: Link2 },
  screenshot: { label: "Screenshot", icon: ImageIcon },
};

export function RecentScans({ limit = 8 }: { limit?: number }) {
  const history = useHistory();
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">No scans yet on this device.</p>
        <Link to="/scan" className="mt-2 inline-block text-sm font-medium text-link hover:underline">
          Check your first message
        </Link>
      </div>
    );
  }
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[13px] text-subtle">
            <th className="px-4 py-2 font-medium sm:px-2">Type</th>
            <th className="px-2 py-2 font-medium">Content</th>
            <th className="px-2 py-2 font-medium">Risk</th>
            <th className="px-2 py-2 font-medium">Verdict</th>
            <th className="px-4 py-2 text-right font-medium sm:px-2">When</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(0, limit).map((h) => {
            const Meta = kindMeta[h.kind];
            return (
              <tr key={h.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 sm:px-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Meta.icon className="size-4 stroke-[1.5]" /> {Meta.label}
                  </span>
                </td>
                <td className="max-w-[220px] px-2 py-3">
                  <p className="truncate font-mono text-xs">{h.title}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{h.category}</p>
                </td>
                <td className="px-2 py-3">
                  <ScoreBar score={h.riskScore} />
                </td>
                <td className="px-2 py-3">
                  <VerdictPill verdict={h.verdict} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted-foreground sm:px-2">{formatDistanceToNow(h.at, { addSuffix: true })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
