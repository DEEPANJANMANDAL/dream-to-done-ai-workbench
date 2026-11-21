import { createFileRoute, Link, useHydrated } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { LogoMark } from "@/components/shield/Logo";
import { STARTER_PROMPTS } from "@/components/shield/assistant-prompts";
import { messageText, threadStore, titleFrom, updateThread, useThreads, type ChatMessage } from "@/lib/threads";

export const Route = createFileRoute("/assistant/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const hydrated = useHydrated();
  const threads = useThreads();
  const thread = threads.find((t) => t.id === threadId);

  if (!hydrated) return <div className="flex-1" />;
  if (!thread) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm">This conversation isn't saved in this browser.</p>
        <Link to="/assistant" className="text-sm font-medium text-link hover:underline">
          Start a new conversation
        </Link>
      </div>
    );
  }
  return <ChatWindow key={threadId} threadId={threadId} />;
}

type Status = "ready" | "submitted" | "streaming" | "error";

function newId() {
  return crypto.randomUUID();
}

function ChatWindow({ threadId }: { threadId: string }) {
  const thread = useThreads().find((t) => t.id === threadId);
  const messages = thread?.messages ?? [];
  const [status, setStatus] = useState<Status>("ready");
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startedPending = useRef(false);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const current = threadStore.read().find((t) => t.id === threadId);
      if (!current) return;
      const userMsg: ChatMessage = { id: newId(), role: "user", parts: [{ type: "text", text }] };
      const history = [...current.messages, userMsg];
      updateThread(threadId, (t) => ({
        ...t,
        title: t.messages.length === 0 ? titleFrom(text) : t.title,
        messages: history,
        updatedAt: Date.now(),
      }));
      setError(null);
      setStreamText("");
      setStatus("submitted");
      focusInput();

      const controller = new AbortController();
      abortRef.current = controller;
      let full = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: messageText(m) })) }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(res.status === 429 ? "Too many questions right now — please wait a moment." : res.status === 402 ? "AI credits have run out for this app." : "The assistant is unavailable right now. Please try again.");
        }
        setStatus("streaming");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreamText(full);
        }
        full += decoder.decode();
        setStatus("ready");
      } catch (e) {
        if (controller.signal.aborted) {
          setStatus("ready");
        } else {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setStatus("error");
        }
      } finally {
        abortRef.current = null;
        if (full.trim()) {
          const assistantMsg: ChatMessage = { id: newId(), role: "assistant", parts: [{ type: "text", text: full }] };
          updateThread(threadId, (t) => ({ ...t, messages: [...t.messages, assistantMsg], updatedAt: Date.now() }));
        }
        setStreamText("");
        focusInput();
      }
    },
    [threadId, focusInput],
  );

  useEffect(() => {
    const pending = thread?.pendingPrompt;
    if (pending && !startedPending.current) {
      startedPending.current = true;
      updateThread(threadId, (t) => {
        const { pendingPrompt: _p, ...rest } = t;
        return rest;
      });
      void send(pending);
    }
  }, [thread?.pendingPrompt, threadId, send]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = status === "submitted" || status === "streaming";

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <LogoMark className="size-5" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{thread?.title ?? "Conversation"}</p>
          <p className="text-xs text-subtle">ScamShield safety assistant</p>
        </div>
      </div>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 && !busy && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Ask your question below, or try one of these</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {STARTER_PROMPTS.slice(0, 4).map((p) => (
                  <button key={p} type="button" onClick={() => void send(p)} className="rounded-lg border border-border px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className="group-[.is-user]:bg-chat-user group-[.is-user]:text-chat-user-foreground">
                {m.role === "assistant" ? (
                  <MessageResponse>{messageText(m)}</MessageResponse>
                ) : (
                  <p className="whitespace-pre-wrap">{messageText(m)}</p>
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Checking scam patterns</Shimmer>
              </MessageContent>
            </Message>
          )}
          {status === "streaming" && streamText && (
            <Message from="assistant">
              <MessageContent>
                <MessageResponse isAnimating>{streamText}</MessageResponse>
              </MessageContent>
            </Message>
          )}
          {error && <p className="rounded-lg border border-warning/30 px-3 py-2 text-sm text-warning">{error}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-border p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            onSubmit={(m) => {
              setInput("");
              void send(m.text);
            }}
          >
            <PromptInputTextarea ref={textareaRef} autoFocus placeholder="Ask a follow-up" onChange={(e) => setInput(e.target.value)} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!busy && !input.trim()} onStop={() => abortRef.current?.abort()} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-subtle">Guidance only, not legal advice. Lost money? Call 1930</p>
        </div>
      </div>
    </>
  );
}
