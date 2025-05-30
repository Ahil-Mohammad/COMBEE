interface AITogglePanelProps {
  enabledAIs: string[];
  onToggle: (enabledAIs: string[]) => void;
}

const AI_OPTIONS = [
  { name: "GPT-4.1-Nano", description: "Fast and efficient" },
  { name: "GPT-4o-Mini", description: "Balanced performance" },
];

export function AITogglePanel({ enabledAIs, onToggle }: AITogglePanelProps) {
  const handleToggle = (aiName: string) => {
    if (enabledAIs.includes(aiName)) {
      onToggle(enabledAIs.filter(name => name !== aiName));
    } else {
      onToggle([...enabledAIs, aiName]);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-400 font-medium">AI Models:</span>
      <div className="flex space-x-3">
        {AI_OPTIONS.map((ai) => (
          <label
            key={ai.name}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={enabledAIs.includes(ai.name)}
                onChange={() => handleToggle(ai.name)}
                className="sr-only"
              />
              <div
                className={`w-12 h-6 rounded-full transition-colors ${
                  enabledAIs.includes(ai.name)
                    ? "bg-blue-600"
                    : "bg-gray-600"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    enabledAIs.includes(ai.name)
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  } mt-0.5`}
                />
              </div>
            </div>
            <div className="text-sm">
              <div className={`font-medium ${enabledAIs.includes(ai.name) ? "text-white" : "text-gray-400"}`}>
                {ai.name}
              </div>
              <div className="text-xs text-gray-500">{ai.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
