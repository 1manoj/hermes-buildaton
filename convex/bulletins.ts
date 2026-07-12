import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const save=mutation({args:{headline:v.string(),script:v.string(),topics:v.array(v.string()),audioUrl:v.optional(v.string()),sourceUrls:v.array(v.string())},handler:async(ctx,args)=>ctx.db.insert("bulletins",{...args,publishedAt:Date.now()})});
export const latest=query({args:{},handler:async ctx=>(await ctx.db.query("bulletins").order("desc").take(10))});
