/**
 * Server-only access to the Nexconn Chat Server API.
 *
 * Secrets (set them in Lovable → Secrets, or in .env.local for local dev):
 *   NEXCONN_APP_KEY     App Key from the Nexconn console
 *   NEXCONN_APP_SECRET  App Secret from the Nexconn console. Never send this to the browser.
 *   NEXCONN_API_HOST    Optional. Defaults to the Singapore data center, api.sg-light-api.com
 *   NEXCONN_AREA        Optional. SG (default), NA, SA or OM. Must match the API host's data center.
 */

const DEFAULT_HOST = "api.sg-light-api.com";
const ALREADY_EXISTS = 23435;
const AREAS = { SG: 2, NA: 3, SA: 5, OM: 6 } as const;

export type NexconnArea = keyof typeof AREAS;

export interface NexconnConfig {
  appKey: string;
  appSecret: string;
  host: string;
  area: NexconnArea;
}

function env(name: string): string | undefined {
  // Cloudflare (nodejs_compat) fills process.env; Nitro also keeps the bindings on globalThis.__env__
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  const fromBindings = (globalThis as { __env__?: Record<string, unknown> }).__env__?.[name];
  const value = fromProcess ?? (typeof fromBindings === "string" ? fromBindings : undefined);
  return value && value.trim() ? value.trim() : undefined;
}

/** Returns null when the keys are not set, so the app can fall back to demo mode. */
export function nexconnConfig(): NexconnConfig | null {
  const appKey = env("NEXCONN_APP_KEY");
  const appSecret = env("NEXCONN_APP_SECRET");
  if (!appKey || !appSecret) return null;
  const area = (env("NEXCONN_AREA")?.toUpperCase() ?? "SG") as NexconnArea;
  return { appKey, appSecret, host: env("NEXCONN_API_HOST") ?? DEFAULT_HOST, area: area in AREAS ? area : "SG" };
}

export function areaCode(area: NexconnArea): number {
  return AREAS[area];
}

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function call<T>(config: NexconnConfig, path: string, body: Record<string, unknown>): Promise<{ code: number; result?: T }> {
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 18);
  const timestamp = String(Date.now());
  const res = await fetch(`https://${config.host}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "App-Key": config.appKey,
      Nonce: nonce,
      Timestamp: timestamp,
      Signature: await sha1Hex(config.appSecret + nonce + timestamp),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const json = (await res.json().catch(() => null)) as { code?: number; result?: T } | null;
  if (!json || typeof json.code !== "number") throw new Error(`Nexconn ${path} returned HTTP ${res.status}`);
  return { code: json.code, ...(json.result !== undefined ? { result: json.result } : {}) };
}

/** Issues a chat access token for one user. */
export async function issueAccessToken(config: NexconnConfig, userId: string, name: string): Promise<string> {
  const { code, result } = await call<{ accessToken?: string; token?: string }>(config, "/v4/auth/access-token/issue", { userId, name });
  const token = result?.accessToken ?? result?.token;
  if (code !== 0 || !token) throw new Error(`Nexconn token issue failed (code ${code})`);
  return token;
}

/**
 * Makes sure the open channel exists. Rooms close after a period with no activity,
 * so this is called on every join: it creates the room with the longest allowed
 * idle lifetime (7 days) and treats "already exists" as success.
 */
export async function ensureOpenChannel(config: NexconnConfig, channelId: string): Promise<void> {
  const { code } = await call(config, "/v4/open-channel/create", { channelId, destroyType: 0, ttlMinutes: 10080 });
  if (code !== 0 && code !== ALREADY_EXISTS) throw new Error(`Nexconn open channel create failed (code ${code})`);
}
