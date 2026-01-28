"use client";

import React, { useState, useCallback } from "react";
import { Menu, X, AlertCircle, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModelSelector } from "@/components/ui/ModelSelector";
import { FineTuningPanel } from "@/components/ui/FineTuningPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showFineTuning, setShowFineTuning] = useState(false);
    const {
        messages,
        conversations,
        currentConversationId,
        selectedModel,
        isLoading,
        error,
        sendMessage,
        startNewConversation,
        loadConversation,
        deleteConversation,
        pinConversation,
        submitFeedback,
        setSelectedModel,
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
                    onPinConversation={pinConversation}
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

                        {/* Title - shows current conversation title */}
                        <div className="hidden sm:block">
                            <h2 className="text-sm font-medium text-dark-200 truncate max-w-[300px]">
                                {currentConversationId
                                    ? conversations.find(c => c.id === currentConversationId)?.title || "Conversation"
                                    : "New Chat"}
                            </h2>
                        </div>
                    </div>

                    {/* Right side - Model Selector & Fine-tuning */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFineTuning(!showFineTuning)}
                            className={cn(
                                "flex items-center gap-2",
                                showFineTuning && "bg-purple-500/20 text-purple-300"
                            )}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="hidden sm:inline">Fine-tune</span>
                        </Button>
                        <ModelSelector
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-dark-400">Ready</span>
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

                {/* Fine-tuning Panel (Slide-over) */}
                {showFineTuning && (
                    <div className="absolute right-0 top-14 bottom-0 w-96 z-40 bg-dark-900/95 backdrop-blur-xl border-l border-dark-700 shadow-2xl overflow-y-auto animate-slide-in">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Fine-tuning</h2>
                                <button
                                    onClick={() => setShowFineTuning(false)}
                                    className="p-2 rounded-lg hover:bg-dark-700"
                                >
                                    <X className="h-4 w-4 text-dark-400" />
                                </button>
                            </div>
                            <FineTuningPanel
                                onModelCreated={(name) => {
                                    setSelectedModel(name);
                                    setShowFineTuning(false);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Chat area */}
                <ChatContainer
                    messages={messages}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
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
