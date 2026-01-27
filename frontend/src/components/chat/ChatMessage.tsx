"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThumbsUp, ThumbsDown, AlertTriangle, BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { ChatMessage as ChatMessageType, SourceDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ChatMessageProps {
    message: ChatMessageType;
    onFeedback?: (messageId: string, feedback: "thumbs_up" | "thumbs_down") => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";

    return (
        <div
            className={cn(
                "flex w-full animate-slide-in",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[85%] md:max-w-[75%]",
                    isUser ? "order-1" : "order-2"
                )}
            >
                {/* Message bubble */}
                <div
                    className={cn(
                        "relative px-4 py-3",
                        isUser
                            ? "chat-bubble-user"
                            : "chat-bubble-assistant"
                    )}
                >
                    {/* Critical warning badge */}
                    {message.is_critical && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-xs font-medium text-red-400">
                                Critical Issue Detected
                            </span>
                        </div>
                    )}

                    {/* Message content */}
                    <div
                        className={cn(
                            "text-sm leading-relaxed",
                            isUser ? "text-white" : "markdown-content text-dark-100"
                        )}
                    >
                        {isUser ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        return inline ? (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <pre className="overflow-x-auto">
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>

                {/* Sources section (for assistant messages) */}
                {isAssistant && message.sources && message.sources.length > 0 && (
                    <div className="mt-2">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sources" className="border-none">
                                <AccordionTrigger className="py-2 px-3 rounded-lg hover:bg-dark-800/50 transition-colors">
                                    <div className="flex items-center gap-2 text-xs text-dark-400">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>{message.sources.length} source{message.sources.length > 1 ? "s" : ""}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 mt-1">
                                        {message.sources.map((source, index) => (
                                            <SourceCard key={index} source={source} index={index} />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

                {/* Footer with timestamp and feedback */}
                <div
                    className={cn(
                        "flex items-center gap-3 mt-1.5 px-1",
                        isUser ? "justify-end" : "justify-between"
                    )}
                >
                    <span className="text-[10px] text-dark-500">
                        {formatDate(message.timestamp)}
                    </span>

                    {/* Feedback buttons (only for assistant) */}
                    {isAssistant && onFeedback && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onFeedback(message.id, "thumbs_up")}
                                className={cn(
                                    "h-6 w-6 rounded-full",
                                    message.feedback === "thumbs_up"
                                        ? "text-green-400 bg-green-500/20"
                                        : "text-dark-500 hover:text-dark-300"
                                )}
                            >
                                <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onFeedback(message.id, "thumbs_down")}
                                className={cn(
                                    "h-6 w-6 rounded-full",
                                    message.feedback === "thumbs_down"
                                        ? "text-red-400 bg-red-500/20"
                                        : "text-dark-500 hover:text-dark-300"
                                )}
                            >
                                <ThumbsDown className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SourceCardProps {
    source: SourceDocument;
    index: number;
}

function SourceCard({ source, index }: SourceCardProps) {
    return (
        <div className="source-card p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-500/20 text-accent-400 text-[10px] font-medium">
                        {index + 1}
                    </span>
                    <span className="text-xs font-medium text-dark-200 truncate max-w-[200px]">
                        {source.source}
                    </span>
                </div>
                {source.relevance_score !== undefined && (
                    <span className="text-[10px] text-dark-500 whitespace-nowrap">
                        {Math.round(source.relevance_score * 100)}% match
                    </span>
                )}
            </div>
            <p className="text-xs text-dark-400 line-clamp-3 leading-relaxed">
                {source.content}
            </p>
        </div>
    );
}

export default ChatMessage;
