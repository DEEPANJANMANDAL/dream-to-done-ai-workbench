# ScamShield

Check SMS, WhatsApp messages, links and screenshots for scams, and see which scams are reaching people across India.

**Live app:** https://dream-to-done-ai-workbench.lovable.app

## What it does

| Page | What you can do |
| --- | --- |
| **Overview** | Paste a message to check it, see national cyber crime trends, the scam map and this week's trending scams |
| **Messages** | Get a verdict (scam, suspicious or looks safe) for an SMS, WhatsApp forward or UPI request, with warning signs and next steps |
| **Links** | Check a link before tapping it: domain, look-alike bank sites, the security certificate and every redirect |
| **Screenshots** | Upload a chat, SMS or "payment done" screenshot to read its text and spot fake payment proofs, scam QR codes and OTP requests |
| **Scam map** | Cyber crime cases by state, crime rate per lakh people, trends over time and fraud categories |
| **Assistant** | Ask about a call, message, UPI ID or link in Hindi, Hinglish, Tamil or any other language. Each conversation has its own page |
| **Scam alerts** | A live chat room, built on the [Nexconn Chat SDK](https://docs.nexconn.ai/chatsdk-web), where people post scams they received. Every post is checked by the scam AI first and shows its verdict to everyone in the room |

Verdicts and answers are written in plain language, and in the user's language when the message isn't in English. Scan history and assistant conversations stay in the browser and are never sent to a server for storage. Posts in Scam alerts are shared with everyone in the room.

## Lost money to a scam?

Call **1930**, the national cyber fraud helpline, within the first hour, and report at [cybercrime.gov.in](https://cybercrime.gov.in). ScamShield gives guidance, not legal advice.

## Data

- **Reported:** state-wise cases, crime rates, national totals and motives come from [NCRB, Crime in India 2023](https://www.ncrb.mha.gov.in/uploads/files/TABLE9A1.pdf).
- **Estimated:** the 2024–25 projections and the fraud category shares are ScamShield estimates. They are always labelled and drawn with dashed lines.

## Tech

- [TanStack Start](https://tanstack.com/start) with React 19 and TypeScript
- Tailwind CSS v4 and Radix UI components
- Recharts for the charts
- AI verdicts and the assistant run server-side through the Lovable AI gateway
- [Nexconn Chat SDK](https://docs.nexconn.ai/chatsdk-web) (`@nexconn/chat`) for the Scam alerts room, with user tokens issued server-side

## Run it locally

You need Node.js and npm.

```sh
git clone https://github.com/DEEPANJANMANDAL/dream-to-done-ai-workbench.git
cd dream-to-done-ai-workbench
npm install
npm run dev
```

The AI features need the `LOVABLE_API_KEY` secret, which Lovable manages for the deployed app. Without it the pages still load, but checks and the assistant return an "unavailable" message.

The Scam alerts room needs two Nexconn secrets. Add them in Lovable under Secrets, or in a `.env.local` file for local development (git ignores it):

| Secret | What it is |
| --- | --- |
| `NEXCONN_APP_KEY` | App Key from the Nexconn console |
| `NEXCONN_APP_SECRET` | App Secret from the Nexconn console. Server-only, never commit it |
| `NEXCONN_API_HOST` | Optional. Defaults to `api.sg-light-api.com` (Singapore) |
| `NEXCONN_AREA` | Optional. `SG` (default), `NA`, `SA` or `OM`, matching the API host |

Without the keys the room runs in demo mode, and posts stay on the device.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm test` | Run the tests |
| `npm run lint` | Run ESLint |

## Editing with Lovable

This project is connected to [Lovable](https://lovable.dev/projects/98fd99e5-b83f-4c08-b642-b457dc1eb4cb). Changes made in Lovable are committed to this repository, and commits pushed to `main` sync back into Lovable.
