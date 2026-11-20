import { createLocalStore } from "./local-store";
import type { Verdict } from "./scam-types";

export type ScanKind = "message" | "url" | "screenshot";

export interface HistoryEntry {
  id: string;
  kind: ScanKind;
  title: string;
  verdict: Verdict;
  riskScore: number;
  category: string;
  at: number;
}

const EMPTY: HistoryEntry[] = [];
export const historyStore = createLocalStore<HistoryEntry[]>("scamshield.history.v1", EMPTY);

export function addHistory(entry: Omit<HistoryEntry, "id" | "at">) {
  historyStore.write((prev) => [{ ...entry, id: crypto.randomUUID(), at: Date.now() }, ...prev].slice(0, 50));
}

export const useHistory = historyStore.useValue;
