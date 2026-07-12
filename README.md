# Overnight Newsroom

A six-agent autonomous newsroom built for the GrowthX Hermes Buildathon, Track 3: **AI as an Agency**.

**Monitor → Editor → Writer → Judge → Anchor → Publisher**

The current MVP is deliberately runnable without credentials. It ingests a deterministic Indian-news demo feed, selects a five-story rundown, writes a bulletin, fact-gates its claims, prepares the voice handoff, publishes a preview, persists run traces, and exposes everything in a newsroom dashboard.

## Run locally

Requirements: Node.js 20+

```bash
cp .env.example .env
npm test
npm run demo
npm start
```

Open <http://localhost:8787> and click **Run newsroom**.

## What works now

- Six visible agents with explicit, logged handoffs
- Source filtering: unverified social-only stories are rejected
- Editorial fact gate before publication
- Persistent run history in `.data/runs.json`
- API endpoints:
  - `GET /api/health`
  - `GET /api/runs`
  - `POST /api/run`
- Responsive, zero-dependency management dashboard
- Automated tests and one-command demo
- Landing-page signup with topic and delivery-frequency preferences
- Telegram deep-link account connection (`/start <token>`)
- Public bulletin publishing to [`@newxroom`](https://t.me/newxroom)
- Personalized private digests through `@newsXroom_bot`
- Hosted Convex schema for users, bulletins, and delivery records

## Product flow

1. A visitor selects topics such as technology, business, sports, or science.
2. Signup creates a profile and returns a unique Telegram deep link.
3. The visitor taps **Start the bot**. Telegram sends `/start <token>` to `@newsXroom_bot`, linking the private chat to the profile.
4. The six-agent newsroom publishes the shared top bulletin to `@newxroom`.
5. Personalized selections are sent privately by the bot because a Telegram channel cannot display different posts to different subscribers.

Run the bot listener and personalized delivery worker:

```bash
npm run bot
npm run digest:send
```

## Convex cloud

The `convex/` directory defines hosted tables and functions. Link this repository to the existing Convex project, then push once:

```bash
npx convex dev
# After .env.local exists:
npx convex dev --once
```

No tables need to be manually created in the dashboard; Convex applies `convex/schema.ts` automatically.

## Live-service configuration

The MVP defaults to `DEMO_MODE=true`. Put credentials in `.env` only—never commit them.

| Integration | Environment variables | Purpose |
|---|---|---|
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` | Editor/writer/judge reasoning |
| ElevenLabs | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | MP3 news anchor |
| Linkup | `LINKUP_API_KEY` | Live news discovery and verification |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` | Public bulletin delivery |
| Convex cloud | `CONVEX_URL` | Hosted run/story persistence |

The deterministic adapters are intentional: the complete product and demo remain testable while sponsor credentials are being provisioned. Each live adapter can replace one boundary without changing the six-agent orchestration.

## Built on Hermes

Hermes is the operating base—not merely a model call. The repository ships an installable skill at `skills/overnight-newsroom/SKILL.md`. When loaded by Hermes, it defines the newsroom operating procedure, editorial safety invariants, execution commands, and verification gates. Hermes invokes and supervises the six-role pipeline while sponsor APIs provide specialist tools.

Install the project skill locally:

```bash
mkdir -p ~/.hermes/skills/overnight-newsroom
cp skills/overnight-newsroom/SKILL.md ~/.hermes/skills/overnight-newsroom/SKILL.md
```

Start a fresh Hermes session and invoke `/overnight-newsroom run a verified India bulletin`. This demonstrates a reusable Hermes capability that can be installed by another operator, not a standalone UI with Hermes branding.

See [`TELEGRAM-SETUP.md`](./TELEGRAM-SETUP.md) for channel setup and ID discovery.

## Architecture

```text
Live feeds / Linkup
       │
   1. Monitor ── raw sourced stories
       │
   2. Editor ─── ranked five-story rundown
       │
   3. Writer ─── broadcast script + citations
       │
   4. Judge ──── claim/source checks (hard gate)
       │
   5. Anchor ─── ElevenLabs audio
       │
   6. Publisher ─ Telegram + dashboard
       │
 Convex / local trace store
```

See [`OVERNIGHT-NEWSROOM.md`](./OVERNIGHT-NEWSROOM.md) for the full competition spec.

## Repository layout

```text
src/                 pipeline, six agent functions, server, persistence
public/              management dashboard
scripts/demo.js      CLI end-to-end demo
test/                Node test suite
OVERNIGHT-NEWSROOM.md full product and judging spec
```

## Next integration order

1. Linkup live retrieval
2. OpenAI structured editor/writer/judge outputs
3. ElevenLabs MP3 generation
4. Telegram channel publishing
5. Hosted Convex persistence
6. Cloudflare deployment

This ordering protects the end-to-end demo: every step remains runnable after each integration.
