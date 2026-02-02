"use client";

import React from "react";
import {
  Plus,
  Trash2,
  MessageSquare,
  Pin,
  Search,
  FolderOpen,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Conversation } from "@/lib/api";
import { Project } from "@/lib/types";
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
  onViewChange?: (view: "chat" | "projects") => void;
  onSearchClick?: () => void;
  currentView?: "chat" | "projects";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  starredProjects?: Project[];
  onSelectProject?: (project: Project) => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onPinConversation,
  onViewChange,
  onSearchClick,
  currentView = "chat",
  isCollapsed = false,
  onToggleCollapse,
  starredProjects = [],
  onSelectProject,
}: SidebarProps) {
  // Separate pinned and regular conversations
  const pinnedConversations = conversations.filter((c) => c.is_pinned);
  const recentConversations = conversations
    .filter((c) => !c.is_pinned)
    .slice(0, 8);

  const handleSearchClick = () => {
    onSearchClick?.();
  };

  const handleProjectsClick = () => {
    onViewChange?.("projects");
  };

  const handleNewChatClick = () => {
    onViewChange?.("chat");
    onNewConversation();
  };

  const handleSelectConversation = (id: string) => {
    onViewChange?.("chat");
    onSelectConversation(id);
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "h-full flex flex-col bg-dark-950 border-r border-dark-800/30 w-full",
        )}
      >
        {/* Header with logo */}
        {/* Header with logo */}
        <div
          className={cn(
            "p-4 border-b border-dark-800/30 flex items-center overflow-hidden whitespace-nowrap",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 transition-all duration-300 ease-in-out overflow-hidden",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100",
            )}
          >
            <div className="relative flex-shrink-0">
              <img
                src="/scio-logo.png"
                alt="Scio Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-semibold text-white">Scio</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="text-dark-400 hover:text-white transition-colors hidden lg:block flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search bar - clickable to open popup */}
        {/* Search bar - clickable to open popup */}
        <div className="px-3 py-2">
          <button
            onClick={handleSearchClick}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-800/50 hover:border-dark-700 transition-colors",
              isCollapsed
                ? "gap-0 w-10 h-10 mx-auto justify-center px-0 py-0 bg-transparent border-transparent hover:bg-dark-800/50"
                : "gap-2",
            )}
            title={isCollapsed ? "Search (⌘K)" : undefined}
          >
            <Search className="w-4 h-4 text-dark-500 flex-shrink-0" />
            <div
              className={cn(
                "flex items-center flex-1 gap-2 overflow-hidden transition-all duration-300",
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100",
              )}
            >
              <span className="text-sm text-dark-500 whitespace-nowrap">
                Search
              </span>
              <span className="ml-auto text-xs text-dark-600 bg-dark-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                ⌘K
              </span>
            </div>
          </button>
        </div>

        {/* Main Menu */}
        <div className="px-2 py-2 border-b border-dark-800/30">
          <p
            className={cn(
              "px-2 text-[10px] font-medium text-dark-600 uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300",
              isCollapsed
                ? "max-h-0 opacity-0 py-0 mb-0"
                : "max-h-8 opacity-100 py-1.5 mb-0",
            )}
          >
            Main Menu
          </p>

          {/* New Chat button */}
          <button
            onClick={handleNewChatClick}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-lg transition-colors",
              currentView === "chat" && !currentConversationId
                ? "bg-dark-800/60 text-white"
                : "text-dark-300 hover:bg-dark-800/50 hover:text-white",
              isCollapsed
                ? "gap-0 w-10 h-10 mx-auto justify-center px-0 py-0"
                : "gap-2.5",
            )}
            title={isCollapsed ? "New Chat" : undefined}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span
              className={cn(
                "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100",
              )}
            >
              New Chat
            </span>
          </button>

          {/* Projects button - combined from Projects + New Project */}
          {/* Projects button - combined from Projects + New Project */}
          {!isCollapsed && (
            <button
              onClick={handleProjectsClick}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                currentView === "projects"
                  ? "bg-dark-800/60 text-white"
                  : "text-dark-400 hover:bg-dark-800/50 hover:text-dark-200",
              )}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm">Projects</span>
              </div>
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Starred Projects Section */}
        {starredProjects.length > 0 && (
          <div className="px-2 py-2 border-b border-dark-800/30">
            <p
              className={cn(
                "px-2 text-[10px] font-medium text-dark-600 uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300",
                isCollapsed
                  ? "max-h-0 opacity-0 py-0"
                  : "max-h-8 opacity-100 py-1.5",
              )}
            >
              Starred
            </p>
            <div className="space-y-0.5">
              {starredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onViewChange?.("projects");
                    onSelectProject?.(project);
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-lg transition-colors text-dark-300 hover:bg-dark-800/50 hover:text-white",
                    isCollapsed
                      ? "gap-0 w-10 h-10 mx-auto justify-center px-0 py-0"
                      : "gap-2",
                  )}
                  title={isCollapsed ? project.name : undefined}
                >
                  <Bookmark className="w-4 h-4 text-cyan-500 fill-cyan-500 flex-shrink-0" />
                  <span
                    className={cn(
                      "text-sm truncate overflow-hidden transition-all duration-300",
                      isCollapsed
                        ? "max-w-0 opacity-0"
                        : "max-w-[180px] opacity-100",
                    )}
                  >
                    {project.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat section - Recent conversations */}
        {/* Chat section - Recent conversations - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="px-2 py-2 border-b border-dark-800/30 flex-1 min-h-0">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-[10px] font-medium text-dark-600 uppercase tracking-wider">
                Chat
              </p>
              <ChevronDown className="w-3 h-3 text-dark-600" />
            </div>

            <ScrollArea className="h-full max-h-[40vh]">
              <div className="space-y-0.5">
                {pinnedConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={
                      conversation.id === currentConversationId &&
                      currentView === "chat"
                    }
                    isCollapsed={isCollapsed}
                    onSelect={() => handleSelectConversation(conversation.id)}
                    onDelete={() => onDeleteConversation(conversation.id)}
                    onPin={() => onPinConversation(conversation.id)}
                  />
                ))}
                {recentConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={
                      conversation.id === currentConversationId &&
                      currentView === "chat"
                    }
                    isCollapsed={isCollapsed}
                    onSelect={() => handleSelectConversation(conversation.id)}
                    onDelete={() => onDeleteConversation(conversation.id)}
                    onPin={() => onPinConversation(conversation.id)}
                  />
                ))}
                {conversations.length === 0 && (
                  <p className="px-3 py-4 text-xs text-dark-600 text-center">
                    No conversations yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Bottom section - Upgrade prompt */}
        {/* {!isCollapsed && (
          <div className="p-3 border-t border-dark-800/30">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-medium text-cyan-400">
                  Pro Mode
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300">
                  NEW
                </span>
              </div>
              <p className="text-[10px] text-dark-400 mb-2">
                Upgrade to pro and enjoy advanced features
              </p>
              <button className="w-full py-1.5 rounded-lg bg-dark-800/80 text-xs text-dark-300 hover:bg-dark-700 transition-colors">
                View Plan
              </button>
            </div>
          </div>
        )}

        {/* User profile */}
        {/* {!isCollapsed && (
          <div className="p-3 border-t border-dark-800/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-medium text-white">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Scio User
                </p>
                <p className="text-[10px] text-dark-500 truncate">
                  student@university.edu
                </p>
              </div>
            </div>
          </div>
        )} */}
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
              "w-full p-2.5 rounded-lg flex items-center justify-center transition-all",
              isActive ? "bg-dark-800/80" : "hover:bg-dark-800/50",
            )}
          >
            <MessageSquare
              className={cn(
                "h-4 w-4",
                isActive ? "text-cyan-400" : "text-dark-500",
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{conversation.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
        isActive
          ? "bg-dark-800/80 text-white"
          : "text-dark-400 hover:bg-dark-800/50 hover:text-dark-200",
      )}
    >
      {conversation.is_pinned ? (
        <Pin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
      ) : (
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span className="text-sm truncate flex-1">{conversation.title}</span>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePin}
          className="p-1 rounded hover:bg-dark-700 transition-colors"
          title={conversation.is_pinned ? "Unpin" : "Pin"}
        >
          <Pin
            className={cn(
              "w-3 h-3",
              conversation.is_pinned ? "text-cyan-400" : "text-dark-500",
            )}
          />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-dark-700 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3 h-3 text-dark-500 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
