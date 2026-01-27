"use client";

import React, { useState, useCallback } from "react";
import { Menu, X, AlertCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {
        messages,
        conversations,
        currentConversationId,
        isLoading,
        error,
        sendMessage,
        startNewConversation,
        loadConversation,
        deleteConversation,
        submitFeedback,
        clearError,
    } = useChat();

    const handleSuggestionClick = useCallback((suggestion: string) => {
        sendMessage(suggestion);
    }, [sendMessage]);

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-700 lg:hidden"
                >
                    <X className="h-5 w-5 text-dark-400" />
                </button>

                <Sidebar
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onNewConversation={startNewConversation}
                    onSelectConversation={loadConversation}
                    onDeleteConversation={deleteConversation}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-4 border-b border-dark-800 bg-dark-900/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Title */}
                        <div className="hidden sm:block">
                            <h2 className="text-sm font-medium text-dark-200">
                                {currentConversationId ? "Conversation" : "New Chat"}
                            </h2>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-dark-400">Scio Ready</span>
                        </div>
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between animate-slide-in">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-red-400">{error}</span>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-400 hover:text-red-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Chat area */}
                <ChatContainer
                    messages={messages}
                    isLoading={isLoading}
                    onFeedback={submitFeedback}
                    onSuggestionClick={handleSuggestionClick}
                />

                {/* Input area */}
                <div className="p-4 border-t border-dark-800 bg-dark-900/30 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto">
                        <ChatInput
                            onSend={sendMessage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
