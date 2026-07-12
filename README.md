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
