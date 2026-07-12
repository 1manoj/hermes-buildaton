import { sampleStories } from "./sample-stories.js";
const stop=new Set(["the","a","an","of","to","and","in","for","on","with","after"]);
function words(s){return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(x=>x.length>3&&!stop.has(x)));}
function overlap(a,b){const x=words(a),y=words(b);return [...x].filter(v=>y.has(v)).length;}
export async function monitor(){return sampleStories.map((s,i)=>({...s,id:`story-${i+1}`,relevance:Math.max(20,100-i*8)}));}
export async function editor(stories){return stories.filter(s=>s.source!=="Social Media").sort((a,b)=>b.relevance-a.relevance).slice(0,5).map((s,i)=>({...s,rank:i+1,angle:i===0?"Lead story":"News brief"}));}
export async function writer(rundown){const lines=rundown.map((s,i)=>`${i===0?"Our top story":"Also in the bulletin"}: ${s.title}. ${s.summary}`);return {headline:rundown[0].title,script:`Good morning. This is Overnight Newsroom. ${lines.join(" ")} That's your verified India briefing.`,citations:rundown.map(s=>({title:s.title,url:s.url,source:s.source}))};}
export async function judge(draft,rundown){const checks=draft.citations.map(c=>({claim:c.title,source:c.source,url:c.url,supported:rundown.some(s=>overlap(s.title,c.title)>=1)}));const passed=checks.every(c=>c.supported)&&draft.script.length>100;return {passed,checks,notes:passed?["All story headlines trace to selected sources."]:["One or more claims lack source support."]};}
export async function anchor(draft){return {status:"demo",audioUrl:null,durationSeconds:Math.ceil(draft.script.split(/\s+/).length/2.5),message:"Connect ElevenLabs to generate the MP3; script is ready."};}
export async function publisher(draft,voice){return {status:"preview",channel:"dashboard",publishedAt:new Date().toISOString(),headline:draft.headline,text:draft.script,audioUrl:voice.audioUrl};}
export const agents={monitor,editor,writer,judge,anchor,publisher};
