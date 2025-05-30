import { Id } from "../../convex/_generated/dataModel";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
}

interface ChatHistoryProps {
  chats: Chat[];
  currentChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  onNewChat: () => void;
}

export function ChatHistory({ chats, currentChatId, onSelectChat, onNewChat }: ChatHistoryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentChatId === chat._id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(chat.lastMessageAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
