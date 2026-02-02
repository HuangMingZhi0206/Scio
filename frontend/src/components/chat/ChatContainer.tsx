"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChatMessage as ChatMessageType } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wifi,
  Monitor,
  Lock,
  Printer,
  HardDrive,
  Shield,
  Mail,
  AlertTriangle,
  Send,
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

// IT Helpdesk suggestion pills
const SUGGESTIONS = [
  {
    icon: Wifi,
    label: "WiFi Issues",
    prompt: "How do I troubleshoot WiFi connectivity problems?",
  },
  {
    icon: Monitor,
    label: "Screen Problems",
    prompt: "My screen is flickering, how can I fix it?",
  },
  {
    icon: Lock,
    label: "Password Reset",
    prompt: "How do I reset my Windows password?",
  },
  {
    icon: Printer,
    label: "Printer Setup",
    prompt: "How do I connect and set up a network printer?",
  },
  {
    icon: HardDrive,
    label: "Storage Issues",
    prompt: "My computer is running out of storage space",
  },
  {
    icon: Shield,
    label: "Security Alert",
    prompt: "How do I scan my computer for viruses?",
  },
  {
    icon: Mail,
    label: "Email Setup",
    prompt: "How do I configure Outlook email?",
  },
  {
    icon: AlertTriangle,
    label: "Blue Screen",
    prompt: "I'm getting a blue screen error, what should I do?",
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
              placeholder="Ask about WiFi, printers, password issues..."
              className="flex-1 bg-transparent text-white placeholder:text-dark-500 outline-none text-[15px]"
            />
            <button
              onClick={handleSubmit}
              className={`p-2 rounded-lg transition-all ${inputValue.trim() ? "bg-cyan-500 text-white" : "text-dark-400"}`}
            >
              <Send className="w-4 h-4" />
            </button>
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
