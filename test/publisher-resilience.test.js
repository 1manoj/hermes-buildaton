import test from "node:test";
import assert from "node:assert/strict";
import { resilientPublication } from "../src/publication.js";

test("publication remains available on the dashboard when Telegram fails", async () => {
  const result = await resilientPublication({ headline: "Verified edition", script: "A sourced bulletin." }, { audioUrl: "/audio/test.mp3" }, async () => { throw new Error("fetch failed"); });
  assert.equal(result.status, "published-with-warning");
  assert.equal(result.channel, "dashboard");
  assert.equal(result.audioUrl, "/audio/test.mp3");
  assert.match(result.deliveryWarning, /fetch failed/);
});

test("publication reports Telegram success", async () => {
  const result = await resilientPublication({ headline: "Edition", script: "Bulletin" }, { audioUrl: null }, async () => ({ message_id: 42 }));
  assert.equal(result.status, "published");
  assert.equal(result.channel, "telegram");
  assert.equal(result.telegramMessageId, 42);
});
