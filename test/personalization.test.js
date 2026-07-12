import test from "node:test";
import assert from "node:assert/strict";
import { createUserRecord, filterRundownForTopics, parseStartToken, createConnectToken } from "../src/users.js";

test("signup normalizes email and preserves selected news tastes", () => {
  const user=createUserRecord({name:" Sid ",email:"SID@Example.com",topics:["technology","business","technology"],frequency:"morning"});
  assert.equal(user.email,"sid@example.com");
  assert.deepEqual(user.topics,["technology","business"]);
  assert.equal(user.telegramChatId,null);
});

test("personalization prioritizes selected categories", () => {
  const rundown=[{title:"Match",category:"sports"},{title:"AI",category:"technology"},{title:"Markets",category:"business"}];
  assert.deepEqual(filterRundownForTopics(rundown,["technology","business"]).map(x=>x.title),["AI","Markets"]);
});

test("Telegram deep-link token round trips to a user id", () => {
  const token=createConnectToken("user-123");
  assert.equal(parseStartToken(`/start ${token}`),"user-123");
  assert.equal(parseStartToken("/help"),null);
});
