"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
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
            {/* Glow effect behind input */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 via-primary-500/10 to-accent-500/10 rounded-2xl blur-xl opacity-50" />

            <div className="relative glass-card rounded-2xl p-2">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isLoading}
                        className="min-h-[52px] max-h-[200px] bg-transparent border-none focus:ring-0 resize-none py-3"
                        rows={1}
                    />

                    <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isLoading || disabled}
                        size="icon"
                        className={cn(
                            "h-11 w-11 rounded-xl shrink-0 transition-all duration-300",
                            message.trim() && !isLoading
                                ? "bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 shadow-lg shadow-accent-500/30"
                                : "bg-dark-700 text-dark-500"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Helper text */}
                <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[10px] text-dark-500">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 font-mono">Shift+Enter</kbd> for new line
                    </span>
                    <span className="text-[10px] text-dark-500">
                        {message.length > 0 && `${message.length} / 4000`}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ChatInput;
