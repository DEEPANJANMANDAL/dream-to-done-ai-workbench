import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, useThreads } from "@/lib/threads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask about a scam call, message or link | ScamShield" },
      { name: "description", content: "Ask whether a UPI ID, call or link is safe, what to do if someone wants your OTP, and how to report online fraud in India. Any language." },
      { property: "og:title", content: "Ask about a scam call, message or link" },
      { property: "og:description", content: "Ask whether a UPI ID, call or link is safe, what to do if someone wants your OTP, and how to report online fraud in India. Any language." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dream-to-done-ai-workbench.lovable.app/assistant" },
      { property: "og:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://dream-to-done-ai-workbench.lovable.app/og.png" },
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
            <MessagesSquare className="size-4 shrink-0 stroke-[1.5] text-violet" /> Conversations
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const id = createThread();
              void navigate({ to: "/assistant/$threadId", params: { threadId: id } });
            }}
          >
            <MessageSquarePlus /> New
          </Button>
        </div>
        {sorted.length === 0 ? (
          <p className="px-1 py-3 text-[13px] text-muted-foreground">No conversations yet</p>
        ) : (
          <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
            {sorted.map((t) => (
              <li
                key={t.id}
                className={cn(
                  "group flex w-56 shrink-0 items-center gap-1 rounded-md border border-transparent transition-colors lg:w-auto",
                  t.id === activeId ? "border-violet/40 bg-violet/10" : "hover:bg-surface-raised",
                )}
              >
                <Link to="/assistant/$threadId" params={{ threadId: t.id }} className="min-w-0 flex-1 px-3 py-2">
                  <span className="block truncate text-sm">{t.title}</span>
                  <span className="block text-xs text-subtle">{formatDistanceToNow(t.updatedAt, { addSuffix: true })}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete conversation ${t.title}`}
                  onClick={() => {
                    deleteThread(t.id);
                    if (t.id === activeId) void navigate({ to: "/assistant" });
                  }}
                  className="mr-1 grid size-7 shrink-0 place-items-center rounded text-muted-foreground opacity-0 transition-[opacity,color] hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-4 stroke-[1.5]" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-auto hidden pt-3 text-xs text-subtle lg:block">Saved only in this browser</p>
      </aside>
      <section className="panel flex min-h-[70dvh] min-w-0 flex-col overflow-hidden lg:h-[calc(100dvh-8rem)] lg:min-h-0">
        <Outlet />
      </section>
    </div>
  );
}
