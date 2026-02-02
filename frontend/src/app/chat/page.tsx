"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Menu, X, AlertCircle, Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { ModelSelector } from "@/components/ui/ModelSelector";

import { SearchPopup } from "@/components/ui/SearchPopup";
import { ProjectsDashboard } from "@/components/ProjectsDashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/types";

// Dynamic import PixelBlast to avoid SSR issues
const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
});

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Mobile sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop sidebar

  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "projects">("chat");
  const [projects, setProjects] = useState<Project[]>([]);
  const [navigatedProject, setNavigatedProject] = useState<Project | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);
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

  // Load projects from localStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("scio_projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const withDates = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        setProjects(withDates);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }

    // Load sidebar state
    const savedSidebar = localStorage.getItem("scio_sidebar_collapsed");
    if (savedSidebar) {
      setSidebarCollapsed(savedSidebar === "true");
    }
  }, []);

  const handleUpdateProjects = useCallback(
    (newProjects: Project[]) => {
      setProjects(newProjects);
      if (isMounted) {
        localStorage.setItem("scio_projects", JSON.stringify(newProjects));
      }
    },
    [isMounted],
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("scio_sidebar_collapsed", String(newState));
      return newState;
    });
  }, []);

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

  const handleStartChatFromProject = useCallback(
    (message: string, projectName?: string) => {
      setCurrentView("chat");
      startNewConversation();
      // Send the message with project context if available
      const fullMessage = projectName
        ? `[Project: ${projectName}] ${message}`
        : message;
      sendMessage(fullMessage);
    },
    [startNewConversation, sendMessage],
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
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-10 transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64",
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
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          starredProjects={projects.filter((p) => p.isStarred)}
          onSelectProject={(project) => {
            setNavigatedProject(project);
            setCurrentView("projects");
          }}
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
          {/* Right side - Model Selector (only in chat view) */}
          {currentView === "chat" && (
            <div className="flex items-center gap-2">
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

        {/* Main view area */}
        {currentView === "projects" ? (
          <ProjectsDashboard
            onNewProject={handleNewProject}
            onBackToChat={() => setCurrentView("chat")}
            onStartChat={handleStartChatFromProject}
            projects={projects}
            onUpdateProjects={handleUpdateProjects}
            selectedProjectExternal={navigatedProject}
            onClearSelectedProject={() => setNavigatedProject(null)}
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
