import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deduplicateStories } from "./news.js";

async function checkedFetch(url, options, label) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }
  return response;
}

export function parseLinkupSources(data) {
  const sources = data.sources || data.results || [];
  return sources.map((item) => ({
    title: item.title || item.name || "Untitled story",
    source: item.name || item.source || new URL(item.url).hostname,
    url: item.url,
    summary: item.snippet || item.content || item.description || "",
    publishedAt: item.publishedAt || item.published_at || null,
    category: "general",
  })).filter((item) => item.url && item.summary);
}

export async function searchLinkup(apiKey) {
  const groups = [
    ["India national affairs verified news last 24 hours", ["thehindu.com", "indianexpress.com", "hindustantimes.com"]],
    ["India and world top verified news last 24 hours", ["reuters.com", "bbc.com", "apnews.com", "aljazeera.com"]],
    ["India business economy markets news last 24 hours", ["economictimes.indiatimes.com", "livemint.com", "moneycontrol.com"]],
    ["India technology science AI space news last 24 hours", ["techcrunch.com", "theverge.com", "arstechnica.com", "nature.com"]],
    ["India sports cricket verified news last 24 hours", ["espncricinfo.com", "sportstar.thehindu.com", "olympics.com"]],
  ];
  const batches = await Promise.all(groups.map(([q,includeDomains],index)=>checkedFetch("https://api.linkup.so/v1/search", { method:"POST", headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"}, body:JSON.stringify({q,depth:"standard",outputType:"searchResults",maxResults:6,includeDomains}) }, `Linkup search ${index+1}`).then(r=>r.json())));
  return deduplicateStories(batches.flatMap(parseLinkupSources));
}

export async function generateOpenAI(apiKey, model, system, input) {
  const response = await checkedFetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
  }, "OpenAI");
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export function chooseVoice(voices) {
  return voices.find((voice) => /news|narrat|presenter|documentary/i.test(`${voice.name} ${JSON.stringify(voice.labels || {})}`)) || voices[0];
}

export async function findElevenLabsVoice(apiKey) {
  const response = await checkedFetch("https://api.elevenlabs.io/v2/voices?page_size=100", { headers: { "xi-api-key": apiKey } }, "ElevenLabs voices");
  const voice = chooseVoice((await response.json()).voices || []);
  if (!voice) throw new Error("ElevenLabs account has no available voice");
  return voice;
}

export async function createSpeech(apiKey, voiceId, text, runId) {
  const response = await checkedFetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.62, similarity_boost: 0.78, style: 0.15, use_speaker_boost: true } }),
  }, "ElevenLabs speech");
  const directory = path.resolve("public", "audio");
  await mkdir(directory, { recursive: true });
  const filename = `${runId}.mp3`;
  await writeFile(path.join(directory, filename), Buffer.from(await response.arrayBuffer()));
  return `/audio/${filename}`;
}

export function buildTelegramText(draft) {
  const sources = draft.citations.map((citation, index) => `${index + 1}. ${citation.source}: ${citation.url}`).join("\n");
  return `📰 ${draft.headline}\n\n${draft.script}\n\nSources:\n${sources}`.slice(0, 4096);
}

export async function publishTelegram(token, channelId, draft) {
  const response = await checkedFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text: buildTelegramText(draft), disable_web_page_preview: true }),
  }, "Telegram publish");
  return (await response.json()).result;
}

export async function publishTelegramAudio(token, channelId, audioPath, draft) {
  const { readFile } = await import("node:fs/promises");
  const form=new FormData(); form.set("chat_id",channelId); form.set("title",draft.headline.slice(0,64)); form.set("caption",`🎙️ ${draft.headline}

Verified by the NewsXroom Judge agent.`); form.set("audio",new Blob([await readFile(audioPath)],{type:"audio/mpeg"}),path.basename(audioPath));
  const response=await checkedFetch(`https://api.telegram.org/bot${token}/sendAudio`,{method:"POST",body:form},"Telegram audio publish"); return (await response.json()).result;
}
