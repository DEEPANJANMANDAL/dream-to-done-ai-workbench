import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageIntro, Panel, VerdictPill } from "@/components/shield/ui";
import { joinAlertsRoom } from "@/lib/alerts.functions";
import { scanMessage } from "@/lib/scan.functions";
import { LiveAlertsRoom, demoMessagesStore, identityStore, newIdentity, type AlertMessage, type AlertVerdict, type LiveStatus, type RoomIdentity } from "@/lib/alerts-room";
import { cn } from "@/lib/utils";

const SITE = "https://dream-to-done-ai-workbench.lovable.app";
const DESC = "A live room where people across India post the scams they receive. Every message is checked by ScamShield and labelled scam, suspicious or safe.";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Scam alerts, warn others about a scam | ScamShield" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Scam alerts — ScamShield" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/alerts` },
      { property: "og:image", content: `${SITE}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og.png` },
    ],
  }),
  component: AlertsPage,
});

type Mode = { kind: "joining" } | { kind: "live"; status: LiveStatus; participants?: number | undefined } | { kind: "demo" } | { kind: "error"; error: string };

function mergeMessages(prev: AlertMessage[], incoming: AlertMessage[]) {
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.sentAt - b.sentAt).slice(-200);
}

function AlertsPage() {
  const identity = identityStore.useValue();
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <PageIntro eyebrow="Scam alerts · Live room" title="Warn others about a scam" description="Post a scam you received so others can spot it too. ScamShield checks every message and labels it before it goes out." />
      {identity ? <Room identity={identity} /> : <JoinForm />}
    </div>
  );
}

function JoinForm() {
  const [name, setName] = useState("");
  return (
    <Panel className="max-w-xl">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) identityStore.write(newIdentity(name));
        }}
      >
        <div>
          <label htmlFor="alert-name" className="text-[15px] font-medium">
            Your name in the room
          </label>
          <p className="mt-1 text-[13px] text-muted-foreground">Shown next to your posts. Use a first name or a nickname, not your phone number</p>
        </div>
        <input
          id="alert-name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="For example, Priya from Pune"
          autoComplete="nickname"
          className="h-11 w-full rounded-[10px] border border-input bg-field px-4 text-[15px] outline-none transition-colors placeholder:text-subtle focus:border-link"
        />
        <Button type="submit" variant="scan" size="lg" disabled={!name.trim()}>
          <Users /> Join the room
        </Button>
      </form>
    </Panel>
  );
}

function Room({ identity }: { identity: RoomIdentity }) {
  const join = useServerFn(joinAlertsRoom);
  const scan = useServerFn(scanMessage);
  const demoMessages = demoMessagesStore.useValue();
  const [mode, setMode] = useState<Mode>({ kind: "joining" });
  const [liveMessages, setLiveMessages] = useState<AlertMessage[]>([]);
  const roomRef = useRef<LiveAlertsRoom | null>(null);

  useEffect(() => {
    let cancelled = false;
    let room: LiveAlertsRoom | null = null;
    (async () => {
      try {
        const res = await join({ data: { userId: identity.userId, name: identity.name } });
        if (cancelled) return;
        if (res.mode === "demo") return setMode({ kind: "demo" });
        if (res.mode === "error") return setMode({ kind: "error", error: res.error });
        room = new LiveAlertsRoom({
          ...res,
          onMessages: (msgs) => setLiveMessages((prev) => mergeMessages(prev, msgs)),
          onStatus: (status, participants) =>
            setMode((prev) => ({ kind: "live", status, participants: participants ?? (prev.kind === "live" ? prev.participants : undefined) })),
        });
        roomRef.current = room;
        await room.connect();
      } catch (e) {
        console.error(e);
        if (!cancelled) setMode({ kind: "error", error: "Couldn't connect to the live room. Check your connection and try again." });
      }
    })();
    return () => {
      cancelled = true;
      roomRef.current = null;
      void room?.disconnect();
    };
  }, [identity.userId, identity.name, join]);

  const messages = mode.kind === "demo" ? demoMessages : liveMessages;

  const post = useCallback(
    async (text: string): Promise<string | null> => {
      let check: AlertVerdict | null = null;
      try {
        const res = await scan({ data: { text } });
        if (res.ok) check = { verdict: res.result.verdict, riskScore: res.result.riskScore, category: res.result.category, summary: res.result.summary };
      } catch {
        check = null;
      }
      if (mode.kind === "demo") {
        demoMessagesStore.write((prev) => mergeMessages(prev, [{ id: `d${Date.now()}`, userId: identity.userId, name: identity.name, text, sentAt: Date.now(), check }]));
        return null;
      }
      const room = roomRef.current;
      if (!room || mode.kind !== "live" || mode.status !== "live") return "The room isn't connected yet. Try again in a moment";
      try {
        const sent = await room.send(identity, text, check);
        setLiveMessages((prev) => mergeMessages(prev, [sent]));
        return null;
      } catch (e) {
        return e instanceof Error && e.message.includes("too fast") ? e.message : "Couldn't post that. Please try again";
      }
    },
    [identity, mode, scan],
  );

  return (
    <div className="space-y-4">
      <StatusBar mode={mode} identity={identity} />
      <Panel className="p-0 sm:p-0">
        <MessageList messages={messages} me={identity.userId} loading={mode.kind === "joining" || (mode.kind === "live" && mode.status === "connecting")} />
        <Composer onPost={post} disabled={mode.kind === "joining" || mode.kind === "error" || (mode.kind === "live" && mode.status !== "live")} />
      </Panel>
    </div>
  );
}

function StatusBar({ mode, identity }: { mode: Mode; identity: RoomIdentity }) {
  const label =
    mode.kind === "joining"
      ? "Joining the room"
      : mode.kind === "demo"
        ? "Demo mode"
        : mode.kind === "error"
          ? "Not connected"
          : mode.status === "live"
            ? `Live${mode.participants ? ` · ${mode.participants} here now` : ""}`
            : mode.status === "offline"
              ? "Offline"
              : "Connecting";
  const dot = mode.kind === "live" && mode.status === "live" ? "bg-safe" : mode.kind === "error" || (mode.kind === "live" && mode.status === "offline") ? "bg-destructive" : "bg-subtle";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", dot)} />
          {label}
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span>
            Posting as <span className="font-medium text-foreground">{identity.name}</span>
          </span>
          <button type="button" className="text-link hover:underline" onClick={() => identityStore.write(null)}>
            Change
          </button>
        </span>
      </div>
      {mode.kind === "demo" && (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-[13px] text-muted-foreground">
          The live room isn't set up on this server yet, so posts stay on this device. Add the Nexconn keys to go live
        </p>
      )}
      {mode.kind === "error" && <p className="rounded-xl border border-destructive/30 bg-surface px-4 py-3 text-[13px] text-destructive">{mode.error}</p>}
    </div>
  );
}

function MessageList({ messages, me, loading }: { messages: AlertMessage[]; me: string; loading: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="max-h-[60dvh] min-h-72 space-y-4 overflow-y-auto p-5 sm:p-6" aria-live="polite">
      {loading && messages.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Loading recent alerts
        </div>
      ) : messages.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2 text-center">
          <Megaphone className="size-6 stroke-[1.5] text-subtle" />
          <p className="text-[15px]">No alerts yet</p>
          <p className="max-w-xs text-[13px] text-muted-foreground">Post a scam you received and it will appear here for everyone in the room</p>
        </div>
      ) : (
        messages.map((m) => <AlertItem key={m.id} m={m} mine={m.userId === me} />)
      )}
      <div ref={endRef} />
    </div>
  );
}

function AlertItem({ m, mine }: { m: AlertMessage; mine: boolean }) {
  return (
    <article className="animate-in fade-in-0 duration-300">
      <header className="mb-2 flex items-baseline gap-2 text-[13px]">
        <span className="font-medium">{mine ? "You" : m.name}</span>
        <span className="text-subtle">{formatDistanceToNow(m.sentAt, { addSuffix: true })}</span>
      </header>
      <div className={cn("rounded-2xl rounded-tl-md border bg-field px-4 py-3", m.check?.verdict === "scam" ? "border-destructive/30" : m.check?.verdict === "suspicious" ? "border-warning/30" : "border-border")}>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.text}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3">
          {m.check ? (
            <>
              <VerdictPill verdict={m.check.verdict} />
              <span className="text-[13px] text-muted-foreground">{m.check.category}</span>
              <span className="font-mono text-xs tabular-nums text-subtle">Risk {m.check.riskScore}%</span>
            </>
          ) : (
            <span className="text-[13px] text-subtle">Not checked</span>
          )}
        </div>
        {m.check?.summary && <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{m.check.summary}</p>}
      </div>
    </article>
  );
}

function Composer({ onPost, disabled }: { onPost: (text: string) => Promise<string | null>; disabled: boolean }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = text.trim();

  return (
    <form
      className="space-y-3 border-t border-border p-5 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (value.length < 3 || busy) return;
        setBusy(true);
        setError(null);
        const err = await onPost(value);
        setBusy(false);
        if (err) setError(err);
        else setText("");
      }}
    >
      <label htmlFor="alert-text" className="sr-only">
        Scam message to post
      </label>
      <textarea
        id="alert-text"
        value={text}
        maxLength={2000}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the scam you received, or describe the call"
        className="min-h-24 w-full resize-y rounded-[10px] border border-input bg-field p-4 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-subtle focus:border-link"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">Remove your own phone number, account or card details before posting</p>
        <Button type="submit" variant="scan" size="lg" className="disabled:aria-busy:opacity-80" aria-busy={busy} disabled={disabled || busy || value.length < 3}>
          {busy ? <Spinner /> : <Megaphone />} {busy ? "Checking and posting" : "Check and post"}
        </Button>
      </div>
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </form>
  );
}
