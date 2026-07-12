import { ConvexHttpClient } from "convex/browser";import { anyApi } from "convex/server";
import { config } from "./config.js";
import { buildTopStories } from "./bulletin-feed.js";
const client=config.convexUrl?new ConvexHttpClient(config.convexUrl):null;
export async function convexSignup(input){if(!client)return null;const payload={...input,email:input.email.trim().toLowerCase(),role:input.role||"user"};const id=await client.mutation(anyApi.users.signup,payload);return {id,...payload};}
export async function saveBulletin(draft,voice,rundown=[]){if(!client)return null;return client.mutation(anyApi.bulletins.save,{headline:draft.headline,script:draft.script,topics:[...new Set((draft.citations||[]).map(x=>x.category||"general"))],audioUrl:voice.audioUrl||undefined,sourceUrls:(draft.citations||[]).map(x=>x.url),stories:buildTopStories(rundown,draft.storyBriefs,voice.storyAudioUrls)});}
export async function latestBulletin(){if(!client)return null;return (await client.query(anyApi.bulletins.latest,{}))[0]||null;}
export async function convexConnectTelegram(userId,chat){if(!client)return null;try{await client.mutation(anyApi.users.connectTelegram,{userId,telegramChatId:String(chat.id),telegramUsername:chat.username||undefined});return await client.query(anyApi.users.get,{userId});}catch{return null;}}
export async function convexListUsers(){if(!client)return [];return client.query(anyApi.users.list,{});}
export async function convexSetUserRole(userId,role){if(!client)return null;return client.mutation(anyApi.users.setRole,{userId,role});}
export async function convexGetSetting(key){if(!client)return null;return client.query(anyApi.settings.get,{key});}
export async function convexSetSetting(key,value){if(!client)return null;return client.mutation(anyApi.settings.set,{key,value});}
export async function convexConnectedUsers(){if(!client)return [];return client.query(anyApi.users.connected,{});}
