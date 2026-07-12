import test from "node:test";import assert from "node:assert/strict";
import { personaSearchPlan } from "../src/persona-search.js";
test("doctor search covers evidence, regulation and clinical change",()=>{const p=personaSearchPlan(["doctor"],["oncology"]);assert.ok(p.queries.some(x=>/clinical trials/i.test(x.query)));assert.ok(p.queries.some(x=>/guideline|drug approval/i.test(x.query)));assert.ok(p.domains.includes("icmr.gov.in"));});
test("investment banker search covers filings, financials, corporate actions and leadership",()=>{const p=personaSearchPlan(["investment-banker"],["Reliance"]);const q=p.queries.map(x=>x.query).join(" ");assert.match(q,/financial results/i);assert.match(q,/corporate actions/i);assert.match(q,/management|board|leadership/i);assert.ok(p.domains.includes("nseindia.com"));});
test("watchlist is included in professional searches",()=>{assert.match(personaSearchPlan(["trader"],["HDFC Bank"]).queries[0].query,/HDFC Bank/);});
