import test from "node:test";
import assert from "node:assert/strict";
import { parseBotCommand, updateTopicsFromCommand, editionAudioPath } from "../src/bot-commands.js";

test("parses Telegram commands with bot suffix",()=>{
  assert.deepEqual(parseBotCommand("/news@newsXroom_bot 4"),{name:"news",args:"4",count:4});
});

test("limits requested story count to two through four",()=>{
  assert.equal(parseBotCommand("/news 9").count,4);
  assert.equal(parseBotCommand("/news 1").count,2);
});

test("taste command accepts supported topics only",()=>{
  assert.deepEqual(updateTopicsFromCommand("technology, business, gossip"),["technology","business"]);
});

test("start token remains available as command arguments",()=>{
  assert.deepEqual(parseBotCommand("/start abc123"),{name:"start",args:"abc123"});
});

test("resolves local edition audio for Telegram direct upload",()=>{
  assert.match(editionAudioPath({audioUrl:"/audio/run-123.mp3"},"/srv/app"),/public\/audio\/run-123\.mp3$/);
  assert.equal(editionAudioPath({audioUrl:"https://cdn.example/a.mp3"},"/srv/app"),"https://cdn.example/a.mp3");
});
