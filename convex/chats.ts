import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("chats")
      .withIndex("by_user_and_last_message", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_chat_and_timestamp", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const getLogs = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) return [];

    return await ctx.db
      .query("aiLogs")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(100);
  },
});

export const createChat = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("chats", {
      userId,
      title: args.title,
      lastMessageAt: Date.now(),
    });
  },
});

export const sendMessage = mutation({
  args: { 
    chatId: v.id("chats"), 
    content: v.string(),
    enabledAIs: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) throw new Error("Chat not found");

    // Insert user message
    const userMessageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId,
      content: args.content,
      isUser: true,
      timestamp: Date.now(),
    });

    // Update chat last message time
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    return userMessageId;
  },
});

export const addAIResponse = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) throw new Error("Chat not found");

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId,
      content: args.content,
      isUser: false,
      timestamp: Date.now(),
    });
  },
});

export const addAILog = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    aiName: v.string(),
    response: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("aiLogs", {
      chatId: args.chatId,
      messageId: args.messageId,
      aiName: args.aiName,
      response: args.response,
      order: args.order,
      timestamp: Date.now(),
    });
  },
});

export const clearLogs = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) throw new Error("Chat not found");

    const logs = await ctx.db
      .query("aiLogs")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});
