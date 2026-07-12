import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const file=path.resolve(".data","users.json");
export function createUserRecord({name,email,topics=[],frequency="morning"}){return {id:`user-${crypto.randomBytes(8).toString("hex")}`,name:String(name||"").trim(),email:String(email||"").trim().toLowerCase(),topics:[...new Set(topics)],frequency,telegramChatId:null,telegramUsername:null,createdAt:new Date().toISOString()};}
export function filterRundownForTopics(rundown,topics){const wanted=new Set(topics);const matches=rundown.filter(x=>wanted.has(x.category));return matches.length?matches:rundown.slice(0,3);}
export function createConnectToken(userId){return Buffer.from(userId).toString("base64url");}
export function parseStartToken(text){const m=String(text||"").match(/^\/start\s+([A-Za-z0-9_-]+)$/);if(!m)return null;try{return Buffer.from(m[1],"base64url").toString("utf8");}catch{return null;}}
export async function listUsers(){try{return JSON.parse(await readFile(file,"utf8"));}catch{return [];}}
async function save(users){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,JSON.stringify(users,null,2));}
export async function signup(input){const users=await listUsers();const email=String(input.email||"").trim().toLowerCase();const current=users.find(x=>x.email===email);if(current){Object.assign(current,{name:String(input.name||current.name).trim(),topics:[...new Set(input.topics||current.topics)],frequency:input.frequency||current.frequency});await save(users);return current;}const user=createUserRecord(input);users.push(user);await save(users);return user;}
export async function connectTelegram(userId,chat){const users=await listUsers();const user=users.find(x=>x.id===userId);if(!user)return null;user.telegramChatId=String(chat.id);user.telegramUsername=chat.username||null;user.telegramConnectedAt=new Date().toISOString();await save(users);return user;}
