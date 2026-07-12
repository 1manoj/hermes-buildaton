import { ConvexHttpClient } from "convex/browser";import { anyApi } from "convex/server";
import { config } from "./config.js";
const client=config.convexUrl?new ConvexHttpClient(config.convexUrl):null;
export async function convexSignup(input){if(!client)return null;const id=await client.mutation(anyApi.users.signup,input);return {id,...input,email:input.email.trim().toLowerCase()};}
export async function saveBulletin(draft,voice){if(!client)return null;return client.mutation(anyApi.bulletins.save,{headline:draft.headline,script:draft.script,topics:[...new Set((draft.citations||[]).map(x=>x.category||"general"))],audioUrl:voice.audioUrl||undefined,sourceUrls:(draft.citations||[]).map(x=>x.url)});}
export async function latestBulletin(){if(!client)return null;return (await client.query(anyApi.bulletins.latest,{}))[0]||null;}
