import test from "node:test";import assert from "node:assert/strict";
import { deduplicateStories, sourceDiversity } from "../src/news.js";
import { contentTypeFor } from "../src/server-utils.js";
test("multi-source merge removes duplicate URLs and near-identical headlines",()=>{const x=deduplicateStories([{title:"India launches new mission today",url:"https://a.test/1",source:"A"},{title:"India launches new mission today live",url:"https://b.test/2",source:"B"},{title:"Markets close higher",url:"https://c.test/3",source:"C"}]);assert.equal(x.length,2);});
test("source diversity reports unique publishers",()=>assert.equal(sourceDiversity([{source:"A"},{source:"B"},{source:"A"}]),2));
test("MP3 files are served as audio/mpeg",()=>assert.equal(contentTypeFor("bulletin.mp3"),"audio/mpeg"));
