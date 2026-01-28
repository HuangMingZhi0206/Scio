"use client";

import React from "react";
import { Plus, Trash2, MessageSquare, Bot, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, truncate } from "@/lib/utils";
import { Conversation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onNewConversation: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onPinConversation: (id: string) => void;
    isCollapsed?: boolean;
}

export function Sidebar({
    conversations,
    currentConversationId,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    onPinConversation,
    isCollapsed = false,
}: SidebarProps) {
    return (
        <TooltipProvider>
            <div
                className={cn(
                    "h-full flex flex-col bg-dark-900/50 backdrop-blur-sm border-r border-dark-800",
                    isCollapsed ? "w-16" : "w-80"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-dark-800">
                    <div className="flex items-center gap-3 mb-4">
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>

                        {!isCollapsed && (
                            <div>
                                <h1 className="font-bold text-lg text-dark-50">Scio</h1>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[10px] text-dark-400">Online</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* New Chat Button */}
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onNewConversation}
                                    className="w-full bg-accent-500/10 hover:bg-accent-500/20 text-accent-400"
                                    size="icon"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">New Chat</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={onNewConversation}
                            className="w-full bg-dark-800 hover:bg-dark-700 text-dark-200 border border-dark-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Chat
                        </Button>
                    )}
                </div>

                {/* Conversation List */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-xs text-dark-500">No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
                                <ConversationItem
                                    key={conversation.id}
                                    conversation={conversation}
                                    isActive={conversation.id === currentConversationId}
                                    isCollapsed={isCollapsed}
                                    onSelect={() => onSelectConversation(conversation.id)}
                                    onDelete={() => onDeleteConversation(conversation.id)}
                                    onPin={() => onPinConversation(conversation.id)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-dark-800">
                        <div className="text-center">
                            <p className="text-[10px] text-dark-500">
                                Powered by Llama 3 + RAG
                            </p>
                            <p className="text-[10px] text-dark-600">
                                Student Project Demo
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    isCollapsed: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onPin: () => void;
}

function ConversationItem({
    conversation,
    isActive,
    isCollapsed,
    onSelect,
    onDelete,
    onPin,
}: ConversationItemProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPin();
    };

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onSelect}
                        className={cn(
                            "w-full p-3 rounded-lg flex items-center justify-center transition-all",
                            isActive
                                ? "bg-accent-500/10 border border-accent-500/30"
                                : "hover:bg-dark-800"
                        )}
                    >
                        <MessageSquare className={cn(
                            "h-4 w-4",
                            isActive ? "text-accent-400" : "text-dark-400"
                        )} />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {conversation.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div
            onClick={onSelect}
            className={cn(
                "conversation-item group",
                isActive && "active"
            )}
        >
            {/* Title row */}
            <div className="flex items-center gap-1.5">
                {conversation.is_pinned && (
                    <Pin className="h-3 w-3 text-accent-400 flex-shrink-0" />
                )}
                <p className={cn(
                    "text-sm font-medium truncate",
                    isActive ? "text-accent-300" : "text-dark-200"
                )}>
                    {conversation.title}
                </p>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-dark-500">
                    {formatDate(conversation.updated_at)}
                </span>
                <span className="text-[10px] text-dark-600">
                    • {conversation.message_count} msgs
                </span>
            </div>

            {/* Action buttons - separate row */}
            <div className="flex items-center gap-2 mt-2">
                <button
                    onClick={handlePin}
                    className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-xs transition-all",
                        conversation.is_pinned
                            ? "bg-accent-500/20 text-accent-400"
                            : "bg-dark-700/50 text-dark-400 hover:text-accent-400 hover:bg-accent-500/20"
                    )}
                    title={conversation.is_pinned ? "Unpin" : "Pin"}
                >
                    <Pin className="h-3 w-3" />
                    <span>{conversation.is_pinned ? "Unpin" : "Pin"}</span>
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-dark-700/50 text-dark-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete"
                >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
