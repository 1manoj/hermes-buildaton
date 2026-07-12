import { config } from "../src/config.js";
if(!config.telegramToken)throw new Error("TELEGRAM_BOT_TOKEN is missing");
const response=await fetch(`https://api.telegram.org/bot${config.telegramToken}/getUpdates`);const data=await response.json();
if(!data.ok)throw new Error(data.description);
const chats=new Map();for(const update of data.result){const message=update.channel_post||update.message||update.my_chat_member?.chat;if(message?.chat)chats.set(message.chat.id,message.chat);else if(message?.id)chats.set(message.id,message);}
if(!chats.size){console.log("No chats found. Add the bot as channel admin, then publish one message in the channel and run this command again.");}else for(const chat of chats.values())console.log(`${chat.title||chat.username||chat.first_name}: ${chat.id} (${chat.type})`);
