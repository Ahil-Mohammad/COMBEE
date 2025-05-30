import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChatHistory } from "./ChatHistory";
import { ChatArea } from "./ChatArea";
import { LogsPanel } from "./LogsPanel";
import { AITogglePanel } from "./AITogglePanel";
import { SignOutButton } from "../SignOutButton";

export function ChatInterface() {
  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [enabledAIs, setEnabledAIs] = useState<string[]>(["GPT-4.1-Nano"]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const chats = useQuery(api.chats.listChats) || [];
  const messages = useQuery(api.chats.getMessages, 
    currentChatId ? { chatId: currentChatId } : "skip"
  ) || [];
  const logs = useQuery(api.chats.getLogs,
    currentChatId ? { chatId: currentChatId } : "skip"
  ) || [];

  const createChat = useMutation(api.chats.createChat);
  const sendMessage = useMutation(api.chats.sendMessage);
  const processWithAIs = useAction(api.ai.processWithAIs);

  const handleNewChat = async () => {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    const chatId = await createChat({ title });
    setCurrentChatId(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId || enabledAIs.length === 0) return;

    setIsProcessing(true);
    try {
      const userMessageId = await sendMessage({
        chatId: currentChatId,
        content,
        enabledAIs,
      });

      await processWithAIs({
        chatId: currentChatId,
        userMessageId,
        prompt: content,
        enabledAIs,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0]._id);
    }
  }, [chats, currentChatId]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">🐝</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full blur-md opacity-60 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold">
              COM<span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">BEE</span>
            </h1>
          </div>
          
          <AITogglePanel 
            enabledAIs={enabledAIs}
            onToggle={setEnabledAIs}
          />
          
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex-shrink-0">
          <ChatHistory
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={setCurrentChatId}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            enabledAIs={enabledAIs}
          />
        </div>

        {/* Logs Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex-shrink-0">
          <LogsPanel
            logs={logs}
            chatId={currentChatId}
          />
        </div>
      </div>
    </div>
  );
}
