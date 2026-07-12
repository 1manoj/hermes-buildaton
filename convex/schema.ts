import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({name:v.string(),email:v.string(),topics:v.array(v.string()),frequency:v.string(),telegramChatId:v.optional(v.string()),telegramUsername:v.optional(v.string()),createdAt:v.number()}).index("by_email",["email"]).index("by_telegram_chat",["telegramChatId"]),
  bulletins: defineTable({headline:v.string(),script:v.string(),topics:v.array(v.string()),audioUrl:v.optional(v.string()),sourceUrls:v.array(v.string()),stories:v.optional(v.array(v.object({title:v.string(),summary:v.string(),shortSummary:v.string(),rank:v.number(),url:v.string(),source:v.string(),category:v.string()}))),publishedAt:v.number()}),
  deliveries: defineTable({userId:v.id("users"),bulletinId:v.optional(v.id("bulletins")),channel:v.string(),status:v.string(),telegramMessageId:v.optional(v.string()),createdAt:v.number()}).index("by_user",["userId"]),
});
