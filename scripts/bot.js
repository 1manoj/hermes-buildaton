import { config } from "../src/config.js";
import { connectTelegram, listUsers, parseStartToken } from "../src/users.js";
import { convexConnectTelegram, convexConnectedUsers, convexUpdateUserTopics } from "../src/convex.js";
import { latestBulletin } from "../src/convex.js";
import { buildFirstBriefing, sendTelegramBriefing } from "../src/first-briefing.js";
import { parseBotCommand,updateTopicsFromCommand,editionAudioPath,botHelp } from "../src/bot-commands.js";
if(!config.telegramToken)throw new Error("TELEGRAM_BOT_TOKEN missing");
let offset=0;console.log("BulletNews bot listener running. Ctrl+C to stop.");
const endpoint=`https://api.telegram.org/bot${config.telegramToken}`;
async function send(chatId,text,reply_markup){const r=await fetch(`${endpoint}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chatId,text,reply_markup,disable_web_page_preview:true})});const x=await r.json();if(!r.ok||!x.ok)throw Error(x.description||"Telegram send failed");return x;}
async function connectedUser(chatId){const users=[...await convexConnectedUsers(),...await listUsers()];return users.find(x=>String(x.telegramChatId)===String(chatId));}
async function deliver(user,chatId,count=4){const edition=await latestBulletin(),briefing=buildFirstBriefing(user,edition,count);return sendTelegramBriefing(config.telegramToken,chatId,briefing,editionAudioPath(edition));}
while(true){try{const r=await fetch(`${endpoint}/getUpdates?timeout=25&offset=${offset}`);const data=await r.json();for(const update of data.result||[]){offset=update.update_id+1;const message=update.message;if(!message?.text)continue;const command=parseBotCommand(message.text),tokenUser=parseStartToken(message.text);let user=await connectedUser(message.chat.id);
if(command?.name==="start"){if(tokenUser)user=await convexConnectTelegram(tokenUser,message.chat)||await connectTelegram(tokenUser,message.chat);if(!user){await send(message.chat.id,"Welcome to BulletNews. Connect this Telegram account from your BulletNews user settings, then send /start again.");continue;}await send(message.chat.id,`Welcome ${user.name}! Your private newsroom is connected. Topics: ${(user.topics||[]).join(", ")}.\n\nPreparing your personalized news now…`,{inline_keyboard:[[{text:"Join public newsroom",url:config.publicChannelUrl}]]});await deliver(user,message.chat.id,4);await send(message.chat.id,botHelp);}
else if(command?.name==="news"){if(!user)await send(message.chat.id,"Connect your account from BulletNews settings first.");else await deliver(user,message.chat.id,command.count);}
else if(command?.name==="taste"){if(!user)await send(message.chat.id,"Connect your account from BulletNews settings first.");else{const topics=updateTopicsFromCommand(command.args);if(!topics.length)await send(message.chat.id,"Choose from: national, business, technology, science, sports, world. Example: /taste technology,business");else{user=await convexUpdateUserTopics(user._id,topics);await send(message.chat.id,`Tastes updated: ${topics.join(", ")}. Send /news to refresh.`);}}}
else if(command?.name==="settings"){await send(message.chat.id,user?`Name: ${user.name}\nTopics: ${(user.topics||[]).join(", ")}\nFrequency: ${user.frequency||"morning"}`:"Connect your account from BulletNews settings first.");}
else if(command?.name==="status"){await send(message.chat.id,user?`✅ Connected to ${user.name}'s BulletNews profile.`:"❌ This Telegram chat is not connected yet.");}
else if(command?.name==="help")await send(message.chat.id,botHelp);else await send(message.chat.id,botHelp);}}
catch(e){console.error("Bot polling error:",e.message);await new Promise(r=>setTimeout(r,3000));}}
