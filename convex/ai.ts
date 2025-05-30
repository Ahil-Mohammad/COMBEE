import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const processWithAIs = action({
  args: {
    chatId: v.id("chats"),
    userMessageId: v.id("messages"),
    prompt: v.string(),
    enabledAIs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    let currentResponse = args.prompt;
    
    const aiConfigs = [
      { name: "GPT-4.1-Nano", model: "gpt-4.1-nano" },
      { name: "GPT-4o-Mini", model: "gpt-4o-mini" },
    ];

    // Filter to only enabled AIs
    const enabledConfigs = aiConfigs.filter(ai => args.enabledAIs.includes(ai.name));

    for (let i = 0; i < enabledConfigs.length; i++) {
      const aiConfig = enabledConfigs[i];
      
      try {
        const systemPrompt = i === 0 
          ? "You are a helpful AI assistant. Provide a thoughtful and comprehensive response to the user's query."
          : "You are reviewing and improving the previous AI's response. Enhance it by adding clarity, accuracy, and helpful details while maintaining the core message.";

        const messages = i === 0 
          ? [{ role: "user" as const, content: currentResponse }]
          : [
              { role: "user" as const, content: args.prompt },
              { role: "assistant" as const, content: currentResponse },
              { role: "user" as const, content: "Please review and improve this response, making it more helpful and comprehensive." }
            ];

        const response = await openai.chat.completions.create({
          model: aiConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const aiResponse = response.choices[0].message.content || "";
        
        // Log this AI's response
        await ctx.runMutation(api.chats.addAILog, {
          chatId: args.chatId,
          messageId: args.userMessageId,
          aiName: aiConfig.name,
          response: aiResponse,
          order: i + 1,
        });

        // Update current response for next AI
        currentResponse = aiResponse;
        
      } catch (error) {
        console.error(`Error with ${aiConfig.name}:`, error);
        
        // Log the error
        await ctx.runMutation(api.chats.addAILog, {
          chatId: args.chatId,
          messageId: args.userMessageId,
          aiName: aiConfig.name,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          order: i + 1,
        });
      }
    }

    // Add final response as AI message
    await ctx.runMutation(api.chats.addAIResponse, {
      chatId: args.chatId,
      messageId: args.userMessageId,
      content: currentResponse,
    });

    return currentResponse;
  },
});
