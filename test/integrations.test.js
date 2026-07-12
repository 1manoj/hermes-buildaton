import test from "node:test";
import assert from "node:assert/strict";
import { parseLinkupSources, chooseVoice, buildTelegramText } from "../src/integrations.js";

test("Linkup result parser normalizes sourced search results", () => {
  const stories = parseLinkupSources({ sources: [{ name: "The Hindu", url: "https://thehindu.com/a", snippet: "India story", title: "A headline" }] });
  assert.deepEqual(stories, [{ title: "A headline", source: "The Hindu", url: "https://thehindu.com/a", summary: "India story", publishedAt: null, category: "general" }]);
});

test("voice chooser prefers a news or narration voice", () => {
  const voice = chooseVoice([{ voice_id: "1", name: "Casual" }, { voice_id: "2", name: "Daniel - News Presenter", labels: { use_case: "news" } }]);
  assert.equal(voice.voice_id, "2");
});

test("normalization tolerates a citation without a title", () => {
  const stories = parseLinkupSources({ sources: [{ name: "Wire", url: "https://example.com", snippet: "Verified story" }] });
  assert.equal(stories[0].title, "Wire");
});

test("Telegram bulletin includes headline, script, and sources", () => {
  const text = buildTelegramText({ headline: "Lead", script: "Bulletin body", citations: [{ source: "Wire", url: "https://example.com" }] });
  assert.match(text, /Lead/);
  assert.match(text, /Bulletin body/);
  assert.match(text, /https:\/\/example.com/);
});
