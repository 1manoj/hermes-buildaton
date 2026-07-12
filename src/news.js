const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(x=>x.length>3);
function similar(a,b){const x=new Set(normalize(a)),y=new Set(normalize(b));const common=[...x].filter(w=>y.has(w)).length;return common/Math.max(1,Math.min(x.size,y.size))>=.75;}
export function deduplicateStories(stories){const seenUrls=new Set(),out=[];for(const story of stories){let url;try{url=new URL(story.url);url.search="";url.hash="";}catch{continue}const key=url.toString();if(seenUrls.has(key)||out.some(x=>similar(x.title,story.title)))continue;seenUrls.add(key);out.push(story);}return out;}
export const sourceDiversity=stories=>new Set(stories.map(x=>x.source).filter(Boolean)).size;
