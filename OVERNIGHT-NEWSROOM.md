# 📰 Overnight Newsroom — Track 3 (AI as an Agency)
## Hermes Buildathon · Pune · July 12, 2026

> **Builder:** Siddharth Shinde (solo)
> **Track:** #3 — AI as an Agency (from Official Idea Library)
> **Difficulty:** HARD
> **Sponsors used:** ElevenLabs · Cloudflare · Convex · Linkup · Dodo Payments · Wispr Flow
> **Hermes usage:** Base harness (6 agents as Hermes skills, orchestrator runs on Hermes)

---

## 1. The idea, one line

**An autonomous newsroom that ships broadcast-quality audio bulletins from live Indian news feeds — with no human trigger. A monitor watches the wires, an editor picks the rundown, a writer scripts it, a judge fact-gates every line, an anchor voices it, and a publisher posts it to a public Telegram channel.**

This is a full 6-agent news operation that replaces a 5-person newsroom desk. Same job, end-to-end, autonomous.

---

## 2. Why this wins Track 3

### It's from the Official Idea Library
GrowthX built this brief themselves. Judges pre-selected it. When you present this, they think *"they picked from our library and executed"* — not *"random idea, let me judge it."*

### The agent count is massive (6 agents, not 4)
Track 3 scoring rewards agent org structure (5x weight). Most teams build 2-3 agents. We build **6 named agents with a manager** — instant L4 on Agent Org.

| Agent | Role | Analogy |
|---|---|---|
| **Monitor** | Watches live RSS feeds + Linkup search | News desk intern reading wires |
| **Editor** | Picks the top 5 stories, builds the rundown | Executive editor deciding what leads |
| **Writer** | Scripts the bulletin in broadcast style | News scriptwriter |
| **Judge** | Fact-checks every claim, flags errors | Editorial standards team |
| **Anchor** | Voices the bulletin via ElevenLabs | TV/Radio news anchor |
| **Publisher** | Posts to Telegram channel + public feed | Distribution desk |

### Real output on REAL surfaces
- Audio bulletins land on a **real Telegram channel** (not a test channel — create one tonight)
- Text bulletins land on a **real public feed** (Cloudflare Pages)
- The output is **listenable by judges on their own phones** during the demo

### Indian-specific = Pune crowd relevance
Every other news AI project is US/Western. An **Indian newsroom** covering **Indian feeds** (NDTV, Indian Express, Economic Times, The Hindu) in **Indian English** with India-relevant stories = instant relatability in the Pune room.

### ElevenLabs newscaster voices = perfect sponsor fit
ElevenLabs has **newscaster voices in their library**. This isn't a hack — it's the exact right use case. The sponsor sees their product doing exactly what it was designed for.

### Cross-track bonus potential
- **Virality:** Every audio bulletin is shareable. If people subscribe to the Telegram channel, that's organic distribution
- **Revenue:** Could charge for custom newsroom setups ($49/newsletter)

---

## 3. The 6 Agents (each is a Hermes skill)

### Agent 1 — **Monitor** ("The Wire Watcher")
- **Input:** List of RSS feeds + keyword triggers
- **Tool:** Linkup web search (sponsor) + direct RSS fetch via Cloudflare Workers
- **Output:** JSON `{stories: [{title, source, summary, url, timestamp, relevance_score}]}`
- **Storage:** Convex `incoming_stories` table
- **Time budget:** 30 sec (runs on cron every 5 min during the event)

**RSS Feed Sources (all free, all live):**

| Source | Feed URL |
|---|---|
| The Hindu | `https://www.thehindu.com/news/feeder/default.rss` |
| Indian Express | `https://indianexpress.com/section/india/feed/` |
| NDTV | `https://feeds.feedburner.com/ndtvnews-top-stories` |
| Economic Times | `https://economictimes.indiatimes.com/rssfeedstopstories.cms` |
| Hindustan Times | `https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml` |
| Times of India | `https://timesofindia.indiatimes.com/rssfeedstopstories.cms` |

### Agent 2 — **Editor** ("The Desk Chief")
- **Input:** 50-100 raw stories from Monitor
- **LLM:** OpenAI GPT-5.6 via Hermes
- **Logic:** Ranks stories by relevance, timeliness, and India-impact. Picks top 5 for the bulletin. Orders them: lead story → national → business → tech → sports/human interest.
- **Output:** JSON `{rundown: [{rank, story_ref, headline, angle, estimated_duration_sec}]}`
- **Storage:** Convex `rundown` table
- **Time budget:** 15 sec

### Agent 3 — **Writer** ("The Scriptwriter")
- **Input:** Rundown from Editor + raw story text from Monitor
- **LLM:** OpenAI GPT-5.6, system prompt = "You are a broadcast news scriptwriter for an Indian English news bulletin. Write in the style of Prannoy Roy / Barkha Dutt. Short sentences. Punchy transitions. Indian context first."
- **Output:** Full broadcast script `{intro, stories: [{script, transition}], sign_off}`
- **Storage:** Convex `scripts` table
- **Time budget:** 30 sec

### Agent 4 — **Judge** ("The Standards Editor")
- **Input:** Full script from Writer + original source URLs
- **LLM:** OpenAI GPT-5.6, system prompt = "You are a fact-checking editor. For every factual claim in this script, verify it against the source article. Flag any: (a) factual errors, (b) exaggerations, (c) missing context, (d) attribution issues."
- **Tool:** Linkup to re-verify any disputed claims
- **Output:** JSON `{approved: true/false, flags: [{line, issue, severity}], revised_script}`
- **Storage:** Convex `edits` table
- **Time budget:** 20 sec
- **Key detail:** If Judge flags issues, the script goes BACK to Writer with the flags. Max 2 revision cycles. This is the **quality gate** that shows the judges the system self-corrects.

### Agent 5 — **Anchor** ("The Voice")
- **Input:** Approved script from Judge
- **Tool:** ElevenLabs TTS (newscaster voice from voice library)
- **Voice:** Pick ONE voice from ElevenLabs newscaster library tonight. Male or female, Indian English accent preferred. Test 3 voices, pick the one that sounds most natural.
- **Output:** MP3 audio file of the full bulletin (~2-3 min)
- **Storage:** Cloudflare R2 (free, sponsor-adjacent)
- **Time budget:** 60-90 sec (ElevenLabs latency for 2-3 min audio)

### Agent 6 — **Publisher** ("The Distribution Desk")
- **Input:** Approved script + audio file + rundown metadata
- **Tools:**
  - Telegram Bot API → posts audio + text summary to public channel
  - Cloudflare Pages → updates public feed at `overnight-newsroom.<your-domain>.dev`
- **Output:** Published bulletin on Telegram + web feed
- **Storage:** Convex `bulletins` table (tracks all published editions)
- **Time budget:** 10 sec

### Orchestrator
- Hermes Agent main loop
- Convex action `runBulletion()` orchestrates the 6 agents in sequence
- If Judge flags issues → automatic revision cycle (Writer → Judge → Anchor)
- Retry logic: if any agent fails, retry once with exponential backoff
- Cron trigger: every 5 min during the event (demonstrates autonomous operation)

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Cron Trigger (every 5 min)                                    │
│   Hermes Agent: "Run the newsroom"                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ MONITOR — "The Wire Watcher"                                  │
│   Linkup search + RSS feed parser                             │
│   → 50-100 raw stories → Convex incoming_stories              │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ EDITOR — "The Desk Chief"                                     │
│   OpenAI: rank + pick top 5 + order                           │
│   → Rundown JSON → Convex rundown                             │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ WRITER — "The Scriptwriter"                                   │
│   OpenAI: broadcast script from rundown + sources             │
│   → Full script → Convex scripts                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ JUDGE — "The Standards Editor"                                │
│   OpenAI + Linkup: fact-check every claim                     │
│   → Approved/rejected → Convex edits                          │
│   ↩ if rejected: back to Writer (max 2 cycles)                │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ ANCHOR — "The Voice"                                          │
│   ElevenLabs TTS (newscaster voice)                           │
│   → MP3 audio → Cloudflare R2                                 │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│ PUBLISHER — "The Distribution Desk"                           │
│   Telegram Bot API + Cloudflare Pages                         │
│   → Published bulletin on Telegram channel + web              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Langfuse — Observability Dashboard                            │
│   Trace tree: Monitor → Editor → Writer → Judge → Anchor → Pub│
│   Token costs per agent, latency per step, filter by role     │
└──────────────────────────────────────────────────────────────┘
```

**Tech stack (all sponsors):**

| Layer | Tech | Sponsor | Power-up |
|---|---|---|---|
| Orchestrator | Hermes Agent (6 skills) | Nous Research | Eligibility |
| Web search | Linkup MCP server | ✅ Linkup | ✅ +25 |
| RSS parsing | Cloudflare Workers | ✅ Cloudflare | ✅ +25 |
| LLM | OpenAI GPT-5.6 | ✅ OpenAI | Eligibility |
| Database | Convex | ✅ Convex | ✅ +25 |
| Voice | ElevenLabs newscaster | ✅ ElevenLabs | ✅ +25 |
| Hosting | Cloudflare Pages | ✅ Cloudflare | (shared) |
| Storage | Cloudflare R2 | ✅ Cloudflare | (shared) |
| Payments | Dodo Payments | ✅ Dodo | ✅ +25 |
| Dictation | Wispr Flow (500+ words) | ✅ Wispr Flow | ✅ +25 |
| Observability | Langfuse (self-hosted) | — | — |

**Power-up total: 6/6 = +150 pts**

---

## 5. Scoring alignment

| Track 3 Parameter | Weight | Our Target | How We Hit It |
|---|---|---|---|
| **Working product** | 20x (80) | **L4** (60 pts) | 6 agents → real audio → real Telegram. Run 3+ bulletins live. 85%+ success rate across runs |
| **Observability** | 7x (28) | **L4** (21 pts) | Langfuse trace tree: who called whom, token costs per agent, filter by role, search across runs |
| **Eval & iteration** | 5x (20) | **L3** (10 pts) | 10 sample stories with expected editorial decisions. Show improvement across prompt versions |
| **Agent org** | 5x (20) | **L4** (15 pts) | 6 named agents + manager that plans subtasks per story type. Not hardcoded — manager decides angle based on story content |
| **Handoffs & memory** | 2x (8) | **L3** (4 pts) | Context carries: Monitor's raw stories → Editor sees them → Writer sees editorial picks → Judge checks against originals → Anchor reads approved script → Publisher gets everything |
| **Cost & latency** | 1x (4) | **L4** (3 pts) | Full bulletin in under 3 min for under $0.50 |
| **Management UI** | 1x (4) | **L3** (2 pts) | Web dashboard: create bulletin, view agents running, see output |
| **Subtotal** | | **115 pts** | |
| Power-ups (6/6) | | **+150 pts** | |
| Cross-track bonus | | **~50 pts** | Telegram subscribers (signups) + shareable audio (reactions) |
| **TOTAL** | | **~315 pts** | |

---

## 6. The 8-hour build timeline

| Time | What ships | Priority |
|---|---|---|
| **10:00–10:30** | Claim ALL partner credits + scaffold Convex project + create Telegram channel + deploy Cloudflare Pages skeleton | 🔴 CRITICAL |
| **10:30–11:30** | Agent 1 (Monitor) — RSS parser + Linkup search → Convex. Test with 3 feeds. | 🔴 CRITICAL |
| **11:30–12:15** | Agent 2 (Editor) — OpenAI ranking + top-5 selection. Agent 3 (Writer) — broadcast script generation. | 🔴 CRITICAL |
| **12:15–12:45** | Agent 4 (Judge) — fact-checking with Linkup verification. Wire revision loop. | 🔴 CRITICAL |
| **12:45–13:30** | **LUNCH** + walk around, show people the Monitor output, talk to mentors | |
| **13:30–14:30** | Agent 5 (Anchor) — ElevenLabs TTS with newscaster voice. Test 3 voices, pick best. | 🔴 CRITICAL |
| **14:30–15:00** | Agent 6 (Publisher) — Telegram bot + Cloudflare Pages feed. End-to-end test. | 🔴 CRITICAL |
| **15:00–15:30** | Orchestrator — wire all 6 agents, Convex actions, cron trigger. Run 3 bulletins. | 🔴 CRITICAL |
| **15:30–16:00** | **Langfuse observability** — trace dashboard, token costs, agent filter | 🟡 HIGH VALUE |
| **16:00–16:15** | Eval set — 10 sample stories, expected decisions, manual comparison | 🟡 HIGH VALUE |
| **16:15–16:30** | Dodo Payments — $49 "deploy your own newsroom" checkout | 🟢 NICE |
| **16:30–17:00** | Landing page polish + 3x demo dry runs (MUST be under 4 min) | 🔴 CRITICAL |
| **17:00–17:30** | Final fixes + submit | 🔴 CRITICAL |

---

## 7. The 4-minute demo script

```
[00:00-00:20] CONTEXT (one sentence)
"This is Overnight Newsroom — a team of 6 AI agents that replaces 
a 5-person news desk. It watches live Indian news feeds, scripts 
a broadcast bulletin, fact-checks every line, voices it with an 
AI anchor, and publishes to a real Telegram channel. Fully 
autonomous. No human trigger."

[00:20-01:30] LIVE DEMO — trigger a bulletin
"I'm going to trigger a live bulletin right now. 
[Open dashboard, click 'Run Bulletin']
The Monitor is pulling stories from NDTV, Indian Express, 
Economic Times, The Hindu — 84 stories incoming...
The Editor just picked the top 5. Lead story: [read the headline]
The Writer is scripting the bulletin in broadcast style...
The Judge is fact-checking — flagged one exaggeration, 
sent it back to the Writer. Writer fixed it. Judge approved.
The Anchor is voicing it now — [play 20 sec of the audio]
And the Publisher just posted it to our Telegram channel.
[Open Telegram on phone, play the audio for judges]"

[01:30-02:30] PROOF (numbers on screen)
"Here's what happened behind the scenes.
[Open Langfuse — show trace tree]
6 agents, 7 handoffs, 1 revision cycle. Total cost: $0.31.
Time: 2 minutes 47 seconds.
[Open Convex — show bulletins table: 4 bulletins published today]
[Open Telegram channel — 4 audio posts, 12 subscribers from the room]
[Open eval dashboard — 10 test stories, 8/10 passed fact-check 
on first pass. After prompt v2, 9/10 pass.]"

[02:30-03:30] THE BUSINESS CASE + Q&A
"This replaces a ₹3-5 lakh/month news desk operation.
Every regional news channel, every content team, every 
media monitoring firm pays humans to do exactly this.
The Dodo checkout is live — $49 to deploy your own 
overnight newsroom for any topic.
Stack: Convex, Cloudflare, ElevenLabs, Linkup, OpenAI, 
all orchestrated by Hermes. All sponsor credits used.
Happy to answer questions."
```

---

## 8. The eval set (critical for Evaluation scoring)

Create a JSON file with 10 test scenarios:

```json
[
  {
    "id": 1,
    "headline": "Sensex crashes 800 points on global sell-off",
    "source": "Economic Times",
    "expected_verdict": "APPROVE — factual, attributed",
    "expected_category": "business",
    "expected_anchor_style": "serious_urgent"
  },
  {
    "id": 2,
    "headline": "Pune metro Phase 3 gets cabinet approval",
    "source": "Indian Express",
    "expected_verdict": "APPROVE — factual, local relevance high",
    "expected_category": "local",
    "expected_anchor_style": "neutral_informative"
  },
  {
    "id": 3,
    "headline": "AI startup raises $50M at $1B valuation",
    "source": "TechCrunch via Linkup",
    "expected_verdict": "VERIFY — check exact figures against source",
    "expected_category": "tech",
    "expected_anchor_style": "enthusiastic_professional"
  },
  {
    "id": 4,
    "headline": "Monsoon arrives 10 days early in Kerala",
    "source": "The Hindu",
    "expected_verdict": "APPROVE — factual",
    "expected_category": "weather",
    "expected_anchor_style": "neutral_informative"
  },
  {
    "id": 5,
    "headline": "Controversial claim: 'India will be $10T economy by 2028'",
    "source": "Opinion piece",
    "expected_verdict": "FLAG — opinion presented as fact, needs attribution",
    "expected_category": "economy",
    "expected_anchor_style": "cautious_balanced"
  },
  {
    "id": 6,
    "headline": "IPL team owner arrested for fraud",
    "source": "NDTV",
    "expected_verdict": "APPROVE — factual, verify arrest details",
    "expected_category": "sports",
    "expected_anchor_style": "serious_measured"
  },
  {
    "id": 7,
    "headline": "New study says coffee prevents cancer",
    "source": "Health blog",
    "expected_verdict": "FLAG — single study, needs context, correlation ≠ causation",
    "expected_category": "health",
    "expected_anchor_style": "cautious_balanced"
  },
  {
    "id": 8,
    "headline": "ISRO launches record 104 satellites",
    "source": "PTI",
    "expected_verdict": "VERIFY — check launch date and count",
    "expected_category": "science",
    "expected_anchor_style": "enthusiastic_professional"
  },
  {
    "id": 9,
    "headline": "Delhi air quality hits 'severe' level",
    "source": "Hindustan Times",
    "expected_verdict": "APPROVE — factual, recurring story",
    "expected_category": "environment",
    "expected_anchor_style": "serious_urgent"
  },
  {
    "id": 10,
    "headline": "Viral tweet claims government banning WhatsApp",
    "source": "Social media",
    "expected_verdict": "REJECT — unverified, likely misinformation",
    "expected_category": "misinfo",
    "expected_anchor_style": "not_included_in_bulletin"
  }
]
```

Run ALL 10 through the pipeline. Record pass/fail for each agent. Show the judge:
- "10 stories tested. Monitor picked up all 10. Editor included 8 in the rundown (correctly rejected 2). Writer scripted all 8. Judge flagged 2 for revision, both corrected. Anchor voiced all 8. Final score: 8/10 on first pass, 10/10 after revision."
- "After optimizing the Judge agent's prompt, first-pass accuracy went from 6/10 to 8/10."

**This is L3-L4 on Evaluation = 10-15 points most teams don't get.**

---

## 9. The management UI

A simple web dashboard (Next.js on Cloudflare Pages) with:

1. **"Run Bulletin" button** — triggers the full pipeline
2. **Live agent status** — Convex realtime subscription showing which agent is running
3. **Bulletin history** — list of all published bulletins with audio playback
4. **Settings** — RSS feeds list, anchor voice selection, Telegram channel config
5. **Langfuse embed** — trace dashboard inline

For L5 Management UI testing: a volunteer should be able to:
1. Add a new RSS feed to the monitor
2. Change the anchor voice
3. Trigger a new bulletin
...all in under 10 minutes unassisted.

---

## 10. Risk matrix

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| ElevenLabs latency too high (>3 min for 2-min audio) | Anchor agent stalls | Medium | Pre-generate 2 sample bulletins as backup. Use ElevenLabs streaming API. |
| RSS feeds rate-limited or down | Monitor gets fewer stories | Low | Linkup fallback: search "latest India news" as backup source |
| Judge agent over-flags (kills too many stories) | Only 1-2 stories make bulletin | Medium | Pre-tune Judge prompt: severity threshold = "material factual error" not "could be clearer" |
| Telegram bot API rate limit | Publisher can't post | Low | Post text first, audio second. Or use Telegram Bot API's sendVoice which has higher limits |
| WiFi dies in venue | Nothing works | Low | Full local dev stack (`npm run dev`), phone tethering, pre-cached RSS data |
| Audio quality sounds robotic | Judges unimpressed | Medium | Test 3 ElevenLabs voices tonight. Pick the most natural. Add SSML for pacing. |
| Fact-checker finds a REAL error in the news | Embarrassing | Low | That's actually GOOD — shows the Judge agent works. Highlight it in the demo. |
| Convex cold-start latency | Slow demo | Low | Use dev deployment (~2s warm start) |
| Content is boring/not Pune-relevant | Low engagement | Medium | Filter Monitor for Pune/Maharashtra stories. Add local news feeds. |

---

## 11. Pitch to Maneesh Bhandari (judge psychology)

> "Overnight Newsroom replaces a ₹3-5 lakh/month news desk operation with 6 AI agents.
> Every regional news channel, every content team, every media monitoring firm in India 
> pays 3-5 humans to do exactly this — watch feeds, pick stories, write scripts, 
> fact-check, voice, publish.
>
> Our system does it for $0.31 per bulletin in under 3 minutes.
> That's a 99.99% cost reduction.
>
> The unit economics: at $49/newsletter × 100 clients/month = $4,900/month revenue 
> on ~$31/month infrastructure cost. 99.4% gross margin.
>
> The moat: each client's editorial preferences train the system. After 30 bulletins, 
> the Editor knows what their audience cares about. A competitor starting fresh has 
> zero editorial memory. This compounds.
>
> Let me show you — I'll trigger a live bulletin right now from the wires..."

**Why this lands with Maneesh:**
- Replaces expensive humans → his sweet spot (Poshmark, GrowthPal, Propeluss)
- Clear unit economics → he's a VC who evaluates business models
- Network effects / data flywheel → "editorial memory compounds" = moat
- Indian market first → his investment thesis (Ecozen, Bharat Innovation Fund)
- "Can this scale into a real business?" → YES, media monitoring is a $2B market

---

## 12. Post-event productization

Regardless of win/loss:

1. **Productize as SaaS:** $49/month for a custom newsroom (topic + voice + frequency)
2. **Open-source the 6 Hermes skills** → GH stars, ecosystem contribution
3. **Blog post:** "How I built a 6-agent autonomous newsroom in 8 hours at the Hermes Buildathon"
4. **Re-use the pattern:** Agent pipeline + observability + eval set = template for any "agency replacement" build
5. **Telegram channel stays live** → continuous demo of the product working

---

## 13. Pre-event checklist (tonight)

### Account setup (30 min):
- [ ] Sign up for Dodo Payments → get API key → settings → promotions → enter code
- [ ] Linkup → sign up → settings → add credits → code `HERMES` → $50
- [ ] Wispr Flow → claim 3 months free via link
- [ ] ElevenLabs → join Discord → #coupon-codes → GrowthX Hackathon → get code
- [ ] Convex → create project `overnight-newsroom`
- [ ] OpenAI → verify $200 credits active (from registration org ID)

### Telegram channel (10 min):
- [ ] Create public Telegram channel: `@OvernightNewsroomPune` or similar
- [ ] Create a bot via @BotFather → get bot token
- [ ] Add bot as admin to the channel
- [ ] Test: send one audio message to the channel

### Convex schema (30 min):
```typescript
// tables.ts
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Raw stories from Monitor agent
  incoming_stories: defineTable({
    bulletin_id: v.id("bulletins"),
    title: v.string(),
    source: v.string(),
    summary: v.string(),
    url: v.string(),
    timestamp: v.number(),
    relevance_score: v.number(),
  }),

  // Editor's picks
  rundown: defineTable({
    bulletin_id: v.id("bulletins"),
    rank: v.number(),
    story_id: v.id("incoming_stories"),
    headline: v.string(),
    angle: v.string(),
    estimated_duration_sec: v.number(),
  }),

  // Writer's script
  scripts: defineTable({
    bulletin_id: v.id("bulletins"),
    full_script: v.string(),
    intro: v.string(),
    stories: v.array(v.object({
      headline: v.string(),
      script: v.string(),
      transition: v.string(),
    })),
    sign_off: v.string(),
    version: v.number(),
  }),

  // Judge's edits
  edits: defineTable({
    bulletin_id: v.id("bulletins"),
    approved: v.boolean(),
    flags: v.array(v.object({
      line: v.string(),
      issue: v.string(),
      severity: v.string(),
    })),
    revision_count: v.number(),
  }),

  // Published bulletins
  bulletins: defineTable({
    status: v.string(), // "running" | "completed" | "failed"
    started_at: v.number(),
    completed_at: v.optional(v.number()),
    audio_url: v.optional(v.string()),
    telegram_message_id: v.optional(v.number()),
    web_url: v.optional(v.string()),
    total_cost_usd: v.optional(v.number()),
    total_latency_ms: v.optional(v.number()),
    agent_trace: v.optional(v.array(v.object({
      agent: v.string(),
      started_at: v.number(),
      completed_at: v.number(),
      tokens_used: v.number(),
      cost_usd: v.number(),
    }))),
  }),
});
```

### Hermes skills (30 min):
Create 6 SKILL.md files under `~/.hermes/skills/overnight-newsroom/`:
- `monitor.md` — RSS parser + Linkup search
- `editor.md` — story ranking + selection
- `writer.md` — broadcast script generation
- `judge.md` — fact-checking + revision loop
- `anchor.md` — ElevenLabs TTS
- `publisher.md` — Telegram + Cloudflare Pages

### Saturday night final:
- [ ] Pre-record 2 sample bulletins as backup
- [ ] Test 3 ElevenLabs newscaster voices → pick best
- [ ] Write the 20-second pitch → time it 3x
- [ ] Verify all API keys work end-to-end

---

## 14. Files to create

```
~/.hermes/projects/overnight-newsroom/
├── OVERNIGHT-NEWSROOM.md    ← this file
├── convex/
│   ├── schema.ts
│   ├── bulletins.ts          ← runBulletion action
│   ├── monitor.ts
│   ├── editor.ts
│   ├── writer.ts
│   ├── judge.ts
│   ├── anchor.ts
│   └── publisher.ts
├── agents/
│   ├── monitor.md            ← Hermes skill
│   ├── editor.md
│   ├── writer.md
│   ├── judge.md
│   ├── anchor.md
│   └── publisher.md
├── eval/
│   ├── test_stories.json     ← 10 test scenarios
│   └── results.md            ← pass/fail after each run
├── frontend/
│   ├── pages/
│   │   └── index.tsx         ← dashboard
│   └── components/
│       ├── BulletinPlayer.tsx
│       └── AgentStatus.tsx
└── scripts/
    ├── setup.sh              ← one-command setup
    └── demo.sh               ← triggers a bulletin for demo
```
