import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lastMessageAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_last_message", ["userId", "lastMessageAt"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    content: v.string(),
    isUser: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_and_timestamp", ["chatId", "timestamp"]),

  aiLogs: defineTable({
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    aiName: v.string(),
    response: v.string(),
    order: v.number(),
    timestamp: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_chat", ["chatId"])
    .index("by_message_and_order", ["messageId", "order"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
