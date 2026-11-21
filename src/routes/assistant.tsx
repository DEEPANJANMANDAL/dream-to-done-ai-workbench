import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, useThreads } from "@/lib/threads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Cyber Safety Assistant — Ask about scams | ScamShield" },
      { name: "description", content: "Ask an AI safety assistant whether a UPI ID, call or link is safe, what to do if someone wants your OTP, and how to report online fraud in India." },
      { property: "og:title", content: "AI Cyber Safety Assistant — ScamShield" },
      { property: "og:description", content: "Ask anything about scams, UPI safety, OTP requests and reporting fraud in India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantLayout,
});

function AssistantLayout() {
  const threads = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeId = params.threadId;

  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="panel flex min-w-0 flex-col p-3 lg:h-[calc(100dvh-8rem)]">
        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="flex items-center gap-2 truncate text-sm font-semibold">
            <MessagesSquare className="size-4 shrink-0 text-primary" /> Conversations
          </h2>
          <Button
            size="sm"
            variant="scan"
            onClick={() => {
              const id = createThread();
              void navigate({ to: "/assistant/$threadId", params: { threadId: id } });
            }}
          >
            <MessageSquarePlus /> New
          </Button>
        </div>
        {sorted.length === 0 ? (
          <p className="px-1 py-3 text-xs text-muted-foreground">No conversations yet. Ask your first question.</p>
        ) : (
          <ul className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
            {sorted.map((t) => (
              <li
                key={t.id}
                className={cn(
                  "group flex w-56 shrink-0 items-center gap-1 rounded-md border border-transparent transition-colors lg:w-auto",
                  t.id === activeId ? "border-primary/40 bg-primary/15" : "hover:bg-secondary",
                )}
              >
                <Link to="/assistant/$threadId" params={{ threadId: t.id }} className="min-w-0 flex-1 px-2.5 py-2">
                  <span className="block truncate text-sm">{t.title}</span>
                  <span className="block text-[10px] text-muted-foreground">{formatDistanceToNow(t.updatedAt, { addSuffix: true })}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete conversation ${t.title}`}
                  onClick={() => {
                    deleteThread(t.id);
                    if (t.id === activeId) void navigate({ to: "/assistant" });
                  }}
                  className="mr-1 grid size-7 shrink-0 place-items-center rounded text-muted-foreground opacity-70 hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-auto hidden pt-3 text-[10px] text-muted-foreground lg:block">Conversations are saved only in this browser.</p>
      </aside>
      <section className="panel flex min-h-[70dvh] min-w-0 flex-col overflow-hidden lg:h-[calc(100dvh-8rem)] lg:min-h-0">
        <Outlet />
      </section>
    </div>
  );
}
