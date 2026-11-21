import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { LogoMark } from "@/components/shield/Logo";
import { STARTER_PROMPTS } from "@/components/shield/assistant-prompts";
import { createThread } from "@/lib/threads";

export const Route = createFileRoute("/assistant/")({
  component: AssistantHome,
});

function AssistantHome() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  function start(prompt: string) {
    const p = prompt.trim();
    if (!p) return;
    const id = createThread(p);
    void navigate({ to: "/assistant/$threadId", params: { threadId: id } });
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <div className="text-center">
          <LogoMark className="mx-auto size-14" />
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">AI Cyber Safety Assistant</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask about a call, message, UPI ID or link. Any language works — Hindi, Hinglish, Tamil and more.</p>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => start(p)}
              className="rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-left text-sm transition-colors hover:border-primary"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <PromptInput onSubmit={(m) => start(m.text)}>
            <PromptInputTextarea autoFocus placeholder="Ask anything about scams or online safety…" onChange={(e) => setText(e.target.value)} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit disabled={!text.trim()} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Guidance only, not legal advice. Lost money? Call 1930 right away.</p>
        </div>
      </div>
    </div>
  );
}
