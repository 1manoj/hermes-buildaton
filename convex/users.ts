import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const signup=mutation({args:{name:v.string(),email:v.string(),topics:v.array(v.string()),frequency:v.string()},handler:async(ctx,args)=>{const email=args.email.trim().toLowerCase();const found=await ctx.db.query("users").withIndex("by_email",q=>q.eq("email",email)).unique();if(found){await ctx.db.patch(found._id,{...args,email});return found._id;}return ctx.db.insert("users",{...args,email,createdAt:Date.now()});}});
export const connectTelegram=mutation({args:{userId:v.id("users"),telegramChatId:v.string(),telegramUsername:v.optional(v.string())},handler:async(ctx,args)=>ctx.db.patch(args.userId,{telegramChatId:args.telegramChatId,telegramUsername:args.telegramUsername})});
export const connected=query({args:{},handler:async ctx=>(await ctx.db.query("users").collect()).filter(x=>x.telegramChatId)});
