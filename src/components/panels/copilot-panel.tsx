"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/hooks/use-sentinel";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import { Sparkles, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopilotPanelProps {
  incident: IncidentAnalysis | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onAsk: (question: string) => void;
}

const QUICK_QUESTIONS = [
  "What is the attacker's most likely objective?",
  "Which assets are at highest risk right now?",
  "What's the fastest containment action?",
  "Should we notify law enforcement?",
  "What regulatory obligations apply to this breach?",
];

function stripMd(text: string): string {
  return text
    .replace(/#{1,4}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

export function CopilotPanel({ incident, messages, isLoading, onAsk }: CopilotPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isLoading) return;
    setInput("");
    onAsk(q);
  };

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3 px-4">
        <div className="p-3 rounded-xl border border-zinc-800/40 bg-zinc-900/20">
          <Sparkles className="h-6 w-6 text-zinc-700" />
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-500 mb-1">Ask ASI-1 anything about this incident</p>
          <p className="text-[10px] text-zinc-600">Available after analysis completes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-600 text-center py-2">Ask ASI-1 anything about the active incident</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => onAsk(q)}
                    disabled={isLoading}
                    className="text-[10px] text-zinc-400 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/60 hover:border-zinc-700 rounded-lg px-2.5 py-2 text-left transition-colors leading-relaxed disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.role === "assistant" && (
                <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-violet-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-500/20 text-blue-100 rounded-tr-sm"
                    : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? stripMd(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Bot className="h-3 w-3 text-violet-400" />
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl rounded-tl-sm px-3 py-2">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-800/60 p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask ASI-1 about this incident..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-lg px-3 py-2 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 p-0 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 border-0"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
