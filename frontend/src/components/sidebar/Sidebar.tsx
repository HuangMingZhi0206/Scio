"use client";

import React from "react";
import { Plus, Trash2, MessageSquare, Bot } from "lucide-react";
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
    isCollapsed?: boolean;
}

export function Sidebar({
    conversations,
    currentConversationId,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    isCollapsed = false,
}: SidebarProps) {
    return (
        <TooltipProvider>
            <div
                className={cn(
                    "h-full flex flex-col bg-dark-900/50 backdrop-blur-sm border-r border-dark-800",
                    isCollapsed ? "w-16" : "w-72"
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

                    {/* New conversation button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onNewConversation}
                                variant="outline"
                                className={cn(
                                    "w-full justify-start gap-2 bg-dark-800/50 hover:bg-dark-700 border-dark-700",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                {!isCollapsed && <span>New Chat</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">New Chat</TooltipContent>
                        )}
                    </Tooltip>
                </div>

                {/* Conversation list */}
                <ScrollArea className="flex-1 px-2 py-2">
                    <div className="space-y-1">
                        {conversations.length === 0 ? (
                            <div className="text-center py-8">
                                {!isCollapsed && (
                                    <>
                                        <MessageSquare className="w-8 h-8 mx-auto text-dark-600 mb-2" />
                                        <p className="text-xs text-dark-500">No conversations yet</p>
                                        <p className="text-[10px] text-dark-600">Start a new chat above</p>
                                    </>
                                )}
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
}

function ConversationItem({
    conversation,
    isActive,
    isCollapsed,
    onSelect,
    onDelete,
}: ConversationItemProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
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
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-accent-300" : "text-dark-200"
                    )}>
                        {conversation.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-dark-500">
                            {formatDate(conversation.updated_at)}
                        </span>
                        <span className="text-[10px] text-dark-600">
                            • {conversation.message_count} msgs
                        </span>
                    </div>
                </div>

                {/* Delete button */}
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                >
                    <Trash2 className="h-3.5 w-3.5 text-dark-500 hover:text-red-400" />
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
