"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChatMessage as ChatMessageType } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Image,
  Code,
  FileText,
  Briefcase,
  Languages,
  Youtube,
  Mail,
  FileSearch,
  Sparkles,
  Send,
  Mic,
  Paperclip,
} from "lucide-react";

// Dynamic import PixelBlast to avoid SSR issues
const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
});

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  selectedModel?: string;
  onFeedback?: (
    messageId: string,
    feedback: "thumbs_up" | "thumbs_down",
  ) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

// Top row suggestions (action buttons in input)
const INPUT_ACTIONS = [
  { icon: Search, label: "Search", color: "text-dark-400" },
  { icon: Image, label: "Create image", color: "text-dark-400" },
];

// Bottom suggestion pills
const SUGGESTIONS = [
  {
    icon: Sparkles,
    label: "AI script writer",
    prompt: "Help me write a script for a presentation",
  },
  { icon: Code, label: "Coding Assistant", prompt: "Help me debug my code" },
  { icon: FileText, label: "Essay writer", prompt: "Help me write an essay" },
  {
    icon: Briefcase,
    label: "Business",
    prompt: "Help me with business planning",
  },
  { icon: Languages, label: "Translate", prompt: "Translate text for me" },
  {
    icon: Youtube,
    label: "YouTube summaries",
    prompt: "Summarize a YouTube video",
  },
  {
    icon: Mail,
    label: "AI Email writing",
    prompt: "Help me write a professional email",
  },
  {
    icon: FileSearch,
    label: "AI pdf chat",
    prompt: "Help me analyze a PDF document",
  },
  {
    icon: Sparkles,
    label: "Research assistant",
    prompt: "Help me research a topic",
  },
];

export function ChatContainer({
  messages,
  isLoading,
  selectedModel,
  onFeedback,
  onSuggestionClick,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* PixelBlast Background - always visible */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${isEmpty ? "opacity-100" : "opacity-30"}`}
      >
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#06b6d4"
          patternScale={2}
          patternDensity={0.8}
          speed={0.3}
          enableRipples={true}
          rippleIntensityScale={0.8}
          edgeFade={0.3}
        />
      </div>

      {isEmpty ? (
        <WelcomeScreen
          onSuggestionClick={onSuggestionClick}
          selectedModel={selectedModel}
        />
      ) : (
        <ScrollArea className="h-full relative z-10" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={onFeedback}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="chat-bubble-assistant px-4 py-3">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void;
  selectedModel?: string;
}

function WelcomeScreen({
  onSuggestionClick,
  selectedModel,
}: WelcomeScreenProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSuggestionClick?.(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 relative z-10">
      {/* Main headline */}
      <h1 className="text-3xl md:text-4xl font-medium text-white mb-10 text-center">
        What's on your mind today?
      </h1>

      {/* Central input box */}
      <div className="w-full max-w-2xl mb-6">
        <div className="bg-dark-900/90 backdrop-blur-md rounded-2xl border border-dark-700/60 overflow-hidden">
          {/* Input field */}
          <div className="flex items-center px-4 py-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI chat..."
              className="flex-1 bg-transparent text-white placeholder:text-dark-500 outline-none text-[15px]"
            />
            <div className="flex items-center gap-1">
              <button className="p-2 text-dark-400 hover:text-dark-200 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmit}
                className={`p-2 rounded-lg transition-all ${inputValue.trim() ? "bg-cyan-500 text-white" : "text-dark-400"}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-dark-800/50">
            {INPUT_ACTIONS.map((action, index) => (
              <button
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800/60 text-dark-400 hover:text-dark-200 hover:bg-dark-700/60 transition-colors text-sm"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion pills - two rows */}
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick?.(suggestion.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-900/60 border border-dark-700/50 text-dark-400 hover:text-dark-200 hover:border-dark-600 hover:bg-dark-800/60 transition-all text-sm backdrop-blur-sm"
          >
            <suggestion.icon className="w-3.5 h-3.5" />
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatContainer;
