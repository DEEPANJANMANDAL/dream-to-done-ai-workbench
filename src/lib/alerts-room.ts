import { customAlphabet } from "nanoid";
import { createLocalStore } from "./local-store";
import type { Verdict } from "./scam-types";

/** The verdict our scam AI gave a message. Travels with the message in its `extra` field. */
export interface AlertVerdict {
  verdict: Verdict;
  riskScore: number;
  category: string;
  summary: string;
}

export interface AlertMessage {
  id: string;
  userId: string;
  name: string;
  text: string;
  sentAt: number;
  check: AlertVerdict | null;
}

export interface RoomIdentity {
  userId: string;
  name: string;
}

const makeUserId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 16);

export const identityStore = createLocalStore<RoomIdentity | null>("scamshield.alerts.identity", null);
/** Demo mode keeps the room on this device only. */
export const demoMessagesStore = createLocalStore<AlertMessage[]>("scamshield.alerts.demo", []);

export function newIdentity(name: string): RoomIdentity {
  return { userId: `u${makeUserId()}`, name: name.trim().slice(0, 40) };
}

export function encodeExtra(check: AlertVerdict | null): string {
  return JSON.stringify({ app: "scamshield", v: 1, check });
}

export function decodeExtra(extra: unknown): AlertVerdict | null {
  if (typeof extra !== "string") return null;
  try {
    const data = JSON.parse(extra) as { app?: string; check?: AlertVerdict | null };
    const c = data.app === "scamshield" ? data.check : null;
    if (!c || !["scam", "suspicious", "safe"].includes(c.verdict)) return null;
    return { verdict: c.verdict, riskScore: Math.max(0, Math.min(100, Number(c.riskScore) || 0)), category: String(c.category ?? "").slice(0, 80), summary: String(c.summary ?? "").slice(0, 400) };
  } catch {
    return null;
  }
}

type Sdk = typeof import("@nexconn/chat");
type Msg = InstanceType<Sdk["Message"]>;

export type LiveStatus = "connecting" | "live" | "reconnecting" | "offline";

let initializedKey: string | null = null;

/**
 * A connection to the shared Nexconn open channel. The SDK is browser-only,
 * so it is loaded lazily on the client.
 */
export class LiveAlertsRoom {
  private sdk: Sdk | null = null;
  private channel: InstanceType<Sdk["OpenChannel"]> | null = null;
  private readonly handlerId = `alerts-${Math.random().toString(36).slice(2)}`;

  constructor(
    private readonly opts: {
      appKey: string;
      token: string;
      areaCode: number;
      channelId: string;
      onMessages: (messages: AlertMessage[]) => void;
      onStatus: (status: LiveStatus, participants?: number) => void;
    },
  ) {}

  private toAlert(m: Msg): AlertMessage | null {
    const content = m.content as { text?: string; extra?: string; senderUserInfo?: { name?: string } };
    if (typeof content?.text !== "string") return null;
    if (m.channelIdentifier?.channelId && m.channelIdentifier.channelId !== this.opts.channelId) return null;
    return {
      id: m.messageId || `${m.senderUserId}-${m.sentTime}`,
      userId: m.senderUserId,
      name: content.senderUserInfo?.name || "Someone",
      text: content.text,
      sentAt: m.sentTime || Date.now(),
      check: decodeExtra(content.extra),
    };
  }

  async connect(): Promise<void> {
    const sdk = (this.sdk = await import("@nexconn/chat"));
    const { NCEngine, MessageHandler, ConnectionStatusHandler, OpenChannel } = sdk;
    if (initializedKey !== this.opts.appKey) {
      NCEngine.initialize({ appKey: this.opts.appKey, areaCode: this.opts.areaCode as never });
      initializedKey = this.opts.appKey;
    }
    NCEngine.addMessageHandler(
      this.handlerId,
      new MessageHandler({
        onMessageReceived: ({ messages }) => {
          const alerts = messages.map((m) => this.toAlert(m)).filter((a): a is AlertMessage => a !== null);
          if (alerts.length) this.opts.onMessages(alerts);
        },
      }),
    );
    NCEngine.addConnectionStatusHandler(
      this.handlerId,
      new ConnectionStatusHandler({
        // 0 = connected, 1 = connecting, anything else = disconnected
        onConnectionStatusChanged: ({ status }) => {
          const s = Number(status);
          this.opts.onStatus(s === 0 ? "live" : s === 1 ? "reconnecting" : "offline");
        },
      }),
    );
    this.opts.onStatus("connecting");
    const conn = await NCEngine.connect({ token: this.opts.token });
    if (!conn.isOk) throw new Error(`connect failed (${conn.code})`);
    this.channel = new OpenChannel(this.opts.channelId);
    const entered = await this.channel.enterChannel({ messageCount: 30 });
    if (!entered.isOk) throw new Error(`enter failed (${entered.code})`);
    this.opts.onStatus("live", entered.data?.participantCount);
  }

  async send(identity: RoomIdentity, text: string, check: AlertVerdict | null): Promise<AlertMessage> {
    if (!this.sdk || !this.channel) throw new Error("Not connected");
    const res = await this.channel.sendMessage(
      new this.sdk.SendTextMessageParams({ text, extra: encodeExtra(check), senderUserInfo: { userId: identity.userId, name: identity.name } }),
    );
    if (!res.isOk) throw new Error(res.code === 23408 || res.code === 23409 ? "You're sending too fast. Wait a moment." : `send failed (${res.code})`);
    return this.toAlert(res.data as Msg) ?? { id: `${Date.now()}`, userId: identity.userId, name: identity.name, text, sentAt: Date.now(), check };
  }

  async disconnect(): Promise<void> {
    if (!this.sdk) return;
    const { NCEngine } = this.sdk;
    NCEngine.removeMessageHandler(this.handlerId);
    NCEngine.removeConnectionStatusHandler(this.handlerId);
    try {
      await this.channel?.exitChannel();
      await NCEngine.disconnect();
    } catch {
      /* already gone */
    }
  }
}
