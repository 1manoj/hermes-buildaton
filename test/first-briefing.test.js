import test from "node:test";
import assert from "node:assert/strict";
import { buildFirstBriefing, selectPersonalizedStories } from "../src/first-briefing.js";

const stories = [
  { title: "AI policy changes", category: "technology", source: "Reuters", url: "https://example.com/ai", shortSummary: "A verified AI policy update." },
  { title: "Markets rise", category: "business", source: "Mint", url: "https://example.com/markets", shortSummary: "Markets moved higher." },
  { title: "Cricket result", category: "sports", source: "Sportstar", url: "https://example.com/sport", shortSummary: "India won the match." },
];

test("first briefing prioritizes selected topics and caps at five stories", () => {
  const selected = selectPersonalizedStories(stories, { topics: ["business"] });
  assert.equal(selected[0].category, "business");
  assert.ok(selected.length <= 5);
});

test("first briefing contains sourced news and Telegram-safe links", () => {
  const briefing = buildFirstBriefing({ name: "Siddharth", topics: ["technology"] }, { headline: "Today", stories });
  assert.match(briefing.text, /Your first BulletNews briefing/);
  assert.match(briefing.text, /AI policy changes/);
  assert.match(briefing.text, /Reuters/);
  assert.match(briefing.text, /https:\/\/example.com\/ai/);
  assert.ok(briefing.text.length <= 4096);
  assert.equal(briefing.stories.length, 3);
});

test("first briefing handles an empty edition honestly", () => {
  const briefing = buildFirstBriefing({ name: "Reader", topics: [] }, null);
  assert.equal(briefing.stories.length, 0);
  assert.match(briefing.text, /latest verified edition is still being prepared/i);
});
