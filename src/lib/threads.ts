import { createLocalStore } from "./local-store";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
}

export interface Thread {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
  /** A first question queued from the welcome screen, sent once the thread page opens. */
  pendingPrompt?: string;
}

const EMPTY: Thread[] = [];
export const threadStore = createLocalStore<Thread[]>("scamshield.threads.v1", EMPTY);
export const useThreads = threadStore.useValue;

export function createThread(pendingPrompt?: string): string {
  const id = crypto.randomUUID().slice(0, 8);
  const thread: Thread = { id, title: pendingPrompt ? titleFrom(pendingPrompt) : "New conversation", updatedAt: Date.now(), messages: [] };
  if (pendingPrompt) thread.pendingPrompt = pendingPrompt;
  threadStore.write((prev) => [thread, ...prev]);
  return id;
}

export function updateThread(id: string, update: (t: Thread) => Thread) {
  threadStore.write((prev) => prev.map((t) => (t.id === id ? update(t) : t)));
}

export function deleteThread(id: string) {
  threadStore.write((prev) => prev.filter((t) => t.id !== id));
}

export function titleFrom(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 46)}…` : clean;
}

export function messageText(m: ChatMessage) {
  return m.parts.map((p) => p.text).join("");
}
