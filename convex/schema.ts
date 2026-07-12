import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({name:v.string(),email:v.string(),topics:v.array(v.string()),frequency:v.string(),role:v.optional(v.string()),personas:v.optional(v.array(v.string())),primaryPersona:v.optional(v.string()),jobTitle:v.optional(v.string()),seniority:v.optional(v.string()),geographies:v.optional(v.array(v.string())),watchlist:v.optional(v.array(v.string())),insightGoals:v.optional(v.array(v.string())),telegramChatId:v.optional(v.string()),telegramUsername:v.optional(v.string()),createdAt:v.number()}).index("by_email",["email"]).index("by_telegram_chat",["telegramChatId"]),
  bulletins: defineTable({headline:v.string(),script:v.string(),topics:v.array(v.string()),audioUrl:v.optional(v.string()),sourceUrls:v.array(v.string()),stories:v.optional(v.array(v.object({title:v.string(),summary:v.string(),shortSummary:v.string(),rank:v.number(),url:v.string(),source:v.string(),category:v.string(),article:v.optional(v.string()),audioScript:v.optional(v.string()),audioUrl:v.optional(v.union(v.string(),v.null()))}))),publishedAt:v.number()}),
  settings: defineTable({key:v.string(),value:v.any(),updatedAt:v.number()}).index("by_key",["key"]),
  deliveries: defineTable({userId:v.id("users"),bulletinId:v.optional(v.id("bulletins")),channel:v.string(),status:v.string(),telegramMessageId:v.optional(v.string()),createdAt:v.number()}).index("by_user",["userId"]),
});
