import { config } from "../src/config.js";import { listUsers } from "../src/users.js";import { convexConnectedUsers } from "../src/convex.js";import { listRuns } from "../src/store.js";
const run=(await listRuns()).find(x=>x.status==="complete");if(!run)throw new Error("No completed bulletin run");const users=[...await convexConnectedUsers(),...(await listUsers()).filter(x=>x.telegramChatId)].filter((x,i,a)=>a.findIndex(y=>y.telegramChatId===x.telegramChatId)===i);for(const user of users){const text=`📰 Your ${user.frequency} NewsXroom digest

Interests: ${user.topics.join(", ")}

${run.publication.text}

Public newsroom: https://t.me/newxroom`;const r=await fetch(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:user.telegramChatId,text:text.slice(0,4096)})});console.log(user.email,(await r.json()).ok?"sent":"failed");}
