import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { areaCode, ensureOpenChannel, issueAccessToken, nexconnConfig } from "./nexconn.server";

/** The one shared room where people warn each other about scams. */
export const ALERTS_CHANNEL_ID = "scamshield-alerts";

export type JoinAlertsResult =
  | { mode: "live"; appKey: string; token: string; areaCode: number; channelId: string }
  | { mode: "demo" }
  | { mode: "error"; error: string };

export const joinAlertsRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; name: string }) =>
    z
      .object({
        userId: z.string().regex(/^[A-Za-z0-9]{6,64}$/),
        name: z.string().trim().min(1).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<JoinAlertsResult> => {
    const config = nexconnConfig();
    if (!config) return { mode: "demo" };
    try {
      await ensureOpenChannel(config, ALERTS_CHANNEL_ID);
      const token = await issueAccessToken(config, data.userId, data.name);
      return { mode: "live", appKey: config.appKey, token, areaCode: areaCode(config.area), channelId: ALERTS_CHANNEL_ID };
    } catch (e) {
      console.error("Nexconn join failed", e);
      return { mode: "error", error: "Couldn't connect to the live room right now. Please try again in a moment." };
    }
  });
