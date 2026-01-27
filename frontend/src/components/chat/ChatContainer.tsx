"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/api";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Wifi, Printer, Key, Terminal, HelpCircle } from "lucide-react";

interface ChatContainerProps {
    messages: ChatMessageType[];
    isLoading?: boolean;
    onFeedback?: (messageId: string, feedback: "thumbs_up" | "thumbs_down") => void;
    onSuggestionClick?: (suggestion: string) => void;
}

const SUGGESTIONS = [
    {
        icon: Wifi,
        title: "WiFi not connecting",
        prompt: "My laptop won't connect to the company WiFi. What should I check?",
    },
    {
        icon: Printer,
        title: "Printer issues",
        prompt: "The printer is showing as offline even though it's turned on. How do I fix this?",
    },
    {
        icon: Key,
        title: "Password reset",
        prompt: "How do I reset my Windows password?",
    },
    {
        icon: Terminal,
        title: "Error codes",
        prompt: "What does Windows error code 0x0000007E mean and how do I fix it?",
    },
];

export function ChatContainer({
    messages,
    isLoading,
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
            {isEmpty ? (
                <WelcomeScreen onSuggestionClick={onSuggestionClick} />
            ) : (
                <ScrollArea className="h-full" ref={scrollRef}>
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
}

function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center px-4">
            {/* Logo and title */}
            <div className="text-center mb-8">
                <div className="relative inline-flex mb-4">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 blur-2xl opacity-30 animate-pulse-slow" />

                    {/* Bot icon */}
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-2xl shadow-accent-500/30">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-dark-50 mb-2">
                    Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">Scio</span>
                </h1>
                <p className="text-dark-400 max-w-md">
                    Your intelligent IT Helpdesk assistant. Ask me about troubleshooting,
                    software setup, error codes, and more.
                </p>
            </div>

            {/* Suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick?.(suggestion.prompt)}
                        className="group glass-card rounded-xl p-4 text-left hover:border-accent-500/30 transition-all duration-300 hover:shadow-glow"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0 group-hover:bg-accent-500/20 transition-colors">
                                <suggestion.icon className="w-5 h-5 text-accent-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-dark-100 mb-1 group-hover:text-accent-300 transition-colors">
                                    {suggestion.title}
                                </h3>
                                <p className="text-xs text-dark-400 line-clamp-2">
                                    {suggestion.prompt}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Status indicator */}
            <div className="mt-8 flex items-center gap-2 text-xs text-dark-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Powered by Llama 3 • Knowledge base ready</span>
            </div>
        </div>
    );
}

export default ChatContainer;
