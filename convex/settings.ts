import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const get=query({args:{key:v.string()},handler:async(ctx,args)=>ctx.db.query("settings").withIndex("by_key",q=>q.eq("key",args.key)).unique()});
export const set=mutation({args:{key:v.string(),value:v.any()},handler:async(ctx,args)=>{const found=await ctx.db.query("settings").withIndex("by_key",q=>q.eq("key",args.key)).unique();if(found){await ctx.db.patch(found._id,{value:args.value,updatedAt:Date.now()});return found._id;}return ctx.db.insert("settings",{...args,updatedAt:Date.now()});}});
