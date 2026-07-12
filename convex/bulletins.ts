import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
const story=v.object({title:v.string(),summary:v.string(),shortSummary:v.string(),rank:v.number(),url:v.string(),source:v.string(),category:v.string()});
export const save=mutation({args:{headline:v.string(),script:v.string(),topics:v.array(v.string()),audioUrl:v.optional(v.string()),sourceUrls:v.array(v.string()),stories:v.optional(v.array(story))},handler:async(ctx,args)=>ctx.db.insert("bulletins",{...args,publishedAt:Date.now()})});
export const latest=query({args:{},handler:async ctx=>(await ctx.db.query("bulletins").order("desc").take(10))});
