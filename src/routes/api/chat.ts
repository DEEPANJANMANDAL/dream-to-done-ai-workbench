import { createFileRoute } from "@tanstack/react-router";
import { streamResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import { SAFETY_CONTEXT, SCAM_MODEL } from "@/lib/scam-ai.server";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .min(1)
    .max(60),
});

const ASSISTANT_INSTRUCTIONS = `${SAFETY_CONTEXT}
You are the ScamShield AI Cyber Safety Assistant, chatting with everyday people in India.
- Answer questions like "Is this UPI ID safe?", "Someone wants my OTP", "I clicked a suspicious link", "How do I report fraud?".
- You cannot look up live databases of UPI IDs or numbers; say so honestly and explain the warning signs (e.g. random-looking handles, names that don't match the payee, unknown banks' handles, requests to "receive" by entering PIN).
- If money was lost: urge them to call 1930 immediately (golden hour), report on cybercrime.gov.in, call their bank to freeze, and keep screenshots/transaction IDs.
- If they clicked a link or installed an app: disconnect data, uninstall unknown apps (especially screen-sharing like AnyDesk/TeamViewer or unknown .apk files), change UPI PIN and net-banking passwords from a different device, check for SIM/eSIM changes.
- Use short paragraphs and bullet lists. Use markdown. Reply in the user's language (Hindi, Hinglish, Tamil, etc.).
- You give guidance, not legal advice.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof bodySchema>;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request", { status: 400 });
        }

        let stream: Awaited<ReturnType<typeof streamResponse<typeof SCAM_MODEL>>>;
        try {
          stream = await streamResponse(
            {
              model: SCAM_MODEL,
              instructions: ASSISTANT_INSTRUCTIONS,
              input: parsed.messages.map((m) => ({ role: m.role, content: m.content })),
              reasoning: { effort: "low" },
            },
            { signal: request.signal },
          );
        } catch (e) {
          if (e instanceof GatewayError) console.error("chat gateway error", e.code, e.httpStatus, e.ids);
          else console.error("chat error", e);
          const status = e instanceof GatewayError && e.httpStatus === 429 ? 429 : e instanceof GatewayError && e.httpStatus === 402 ? 402 : 502;
          return new Response("The assistant is unavailable right now.", { status });
        }

        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const event of stream) {
                if (event.type === "response.output_text.delta") {
                  controller.enqueue(encoder.encode(event.delta));
                }
              }
            } catch (e) {
              console.error("chat stream error", e);
              controller.enqueue(encoder.encode("\n\n_The answer was cut off. Please try again._"));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
