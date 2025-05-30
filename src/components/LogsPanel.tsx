import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AILog {
  _id: Id<"aiLogs">;
  aiName: string;
  response: string;
  order: number;
  timestamp: number;
}

interface LogsPanelProps {
  logs: AILog[];
  chatId: Id<"chats"> | null;
}

export function LogsPanel({ logs, chatId }: LogsPanelProps) {
  const clearLogs = useMutation(api.chats.clearLogs);

  const handleClearLogs = async () => {
    if (chatId) {
      await clearLogs({ chatId });
    }
  };

  // Group logs by message and sort by order
  const groupedLogs = logs.reduce((acc, log) => {
    const key = log.timestamp;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<number, AILog[]>);

  // Sort each group by order
  Object.values(groupedLogs).forEach(group => {
    group.sort((a, b) => a.order - b.order);
  });

  // Sort groups by timestamp (newest first)
  const sortedGroups = Object.entries(groupedLogs).sort(([a], [b]) => Number(b) - Number(a));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-white">AI Processing Logs</h3>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Clear Logs
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">📋</div>
            <p>No processing logs yet</p>
            <p className="text-sm mt-1">Send a message to see AI responses</p>
          </div>
        ) : (
          sortedGroups.map(([timestamp, groupLogs]) => (
            <div key={timestamp} className="space-y-2">
              <div className="text-xs text-gray-500 font-medium">
                {new Date(Number(timestamp)).toLocaleString()}
              </div>
              {groupLogs.map((log) => (
                <div
                  key={log._id}
                  className="bg-gray-700 rounded-lg p-3 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-400 text-sm">
                      {log.aiName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Step {log.order}
                    </span>
                  </div>
                  <div className="text-sm text-gray-200 whitespace-pre-wrap">
                    {log.response}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
