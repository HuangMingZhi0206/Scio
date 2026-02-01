"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2, Paperclip, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Ask about WiFi issues, printer problems, error codes...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message);
      setMessage("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Main input container */}
      <div className="relative bg-dark-900/80 rounded-2xl border border-dark-700/60 shadow-xl shadow-black/20 backdrop-blur-sm overflow-hidden transition-all duration-200 focus-within:border-cyan-500/50 focus-within:shadow-cyan-500/10">
        {/* Top action bar */}
        <div className="flex items-center gap-1 px-3 pt-3">
          <button
            className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-dark-800/60 text-[10px] text-dark-500">
            <Sparkles className="w-3 h-3" />
            <span>AI Powered</span>
          </div>
        </div>

        {/* Input area */}
        <div className="flex items-end gap-3 px-3 pb-3 pt-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            disabled={disabled || isLoading}
            className="min-h-[44px] max-h-[200px] bg-transparent border-none focus:ring-0 resize-none py-2 text-white placeholder:text-dark-500 text-[15px]"
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl shrink-0 transition-all duration-300",
              message.trim() && !isLoading
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/30"
                : "bg-dark-800 text-dark-500 border border-dark-700",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between px-2 pt-2">
        <span className="text-[11px] text-dark-500">
          <kbd className="px-1.5 py-0.5 rounded bg-dark-800 text-dark-400 font-mono text-[10px] mr-1">
            ⏎
          </kbd>
          to send
          <span className="mx-2 text-dark-600">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-dark-800 text-dark-400 font-mono text-[10px] mr-1">
            ⇧ ⏎
          </kbd>
          for new line
        </span>
        <span className="text-[11px] text-dark-500">
          {message.length > 0 && (
            <span className={message.length > 3500 ? "text-amber-400" : ""}>
              {message.length} / 4000
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default ChatInput;
