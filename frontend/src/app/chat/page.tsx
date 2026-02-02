"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Menu, X, AlertCircle, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModelSelector } from "@/components/ui/ModelSelector";
import { FineTuningPanel } from "@/components/ui/FineTuningPanel";
import { SearchPopup } from "@/components/ui/SearchPopup";
import { ProjectsDashboard } from "@/components/ProjectsDashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dynamic import PixelBlast to avoid SSR issues
const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
});

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFineTuning, setShowFineTuning] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "projects">("chat");
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

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage],
  );

  const handleViewChange = useCallback((view: "chat" | "projects") => {
    setCurrentView(view);
  }, []);

  const handleNewProject = useCallback(() => {
    // For now, just start a new conversation
    // Can be enhanced later for actual project functionality
    setCurrentView("chat");
    startNewConversation();
  }, [startNewConversation]);

  const handleSearchClick = useCallback(() => {
    setShowSearchPopup(true);
  }, []);

  const handleSearchSelect = useCallback(
    (id: string) => {
      setCurrentView("chat");
      loadConversation(id);
      setShowSearchPopup(false);
    },
    [loadConversation],
  );

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Global PixelBlast Background - visible behind transparent elements */}
      <div className="fixed inset-0 z-0">
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
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-10 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
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
          onViewChange={handleViewChange}
          onSearchClick={handleSearchClick}
          currentView={currentView}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 relative z-10",
          messages.length > 0 && "backdrop-blur-md bg-dark-950/30",
        )}
      >
        {/* Header */}
        <header className="h-12 flex items-center justify-between px-4">
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

            {/* Title - shows current conversation title or view name */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <h2 className="text-sm font-medium text-dark-200 truncate max-w-[300px]">
                {currentView === "projects"
                  ? "Projects"
                  : currentConversationId
                    ? conversations.find((c) => c.id === currentConversationId)
                        ?.title || "Conversation"
                    : "New Chat"}
              </h2>
            </div>
          </div>

          {/* Right side - Model Selector & Fine-tuning (only in chat view) */}
          {currentView === "chat" && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFineTuning(!showFineTuning)}
                className={cn(
                  "flex items-center gap-2 rounded-lg",
                  showFineTuning && "bg-cyan-500/20 text-cyan-300",
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Fine-tune</span>
              </Button>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800/60 border border-dark-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-dark-400">Ready</span>
              </div>
            </div>
          )}
        </header>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between animate-slide-in relative z-20">
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
                <h2 className="text-lg font-semibold text-white">
                  Fine-tuning
                </h2>
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

        {/* Main view area */}
        {currentView === "projects" ? (
          <ProjectsDashboard
            onNewProject={handleNewProject}
            onBackToChat={() => setCurrentView("chat")}
          />
        ) : (
          <>
            {/* Chat area */}
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onFeedback={submitFeedback}
              onSuggestionClick={handleSuggestionClick}
            />

            {/* Input area */}
            {messages.length > 0 && (
              <div className="p-4">
                <div className="max-w-3xl mx-auto">
                  <ChatInput onSend={sendMessage} isLoading={isLoading} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Search Popup - rendered in main dashboard */}
      <SearchPopup
        isOpen={showSearchPopup}
        onClose={() => setShowSearchPopup(false)}
        conversations={conversations}
        onSelectConversation={handleSearchSelect}
      />
    </div>
  );
}
