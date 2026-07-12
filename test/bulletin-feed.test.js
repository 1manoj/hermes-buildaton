import test from "node:test";import assert from "node:assert/strict";
import { buildTopStories, shortText } from "../src/bulletin-feed.js";
test("top feed returns no more than five ranked stories",()=>{const input=Array.from({length:7},(_,i)=>({title:`Story ${i}`,summary:`Summary ${i}`,rank:i+1,url:`https://example.com/${i}`,source:"Wire"}));const out=buildTopStories(input);assert.equal(out.length,5);assert.deepEqual(out.map(x=>x.rank),[1,2,3,4,5]);});
test("short text is concise without cutting whole short summaries",()=>{assert.equal(shortText("Short update."),"Short update.");assert.ok(shortText("x".repeat(300)).length<=163);});
test("top feed preserves detail fields needed by cards",()=>{const [story]=buildTopStories([{title:"Lead",summary:"Brief",rank:1,url:"https://example.com",source:"Wire",category:"national"}]);assert.deepEqual(story,{title:"Lead",summary:"Brief",shortSummary:"Brief",rank:1,url:"https://example.com",source:"Wire",category:"national"});});
