"use client";

import React from "react";
import {
  Plus,
  Trash2,
  MessageSquare,
  Pin,
  Search,
  FolderOpen,
  FileText,
  Settings,
  Bot,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
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

// Menu sections matching reference design
const MENU_SECTIONS = [
  { icon: FolderOpen, label: "Projects", hasChevron: true },
  { icon: FileText, label: "New Project", hasChevron: true },
  { icon: Bot, label: "Gullint" },
  { icon: FileText, label: "General Knowledge" },
  { icon: FileText, label: "Sheets" },
  { icon: Settings, label: "Setting", hasChevron: true },
];

export function Sidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onPinConversation,
  isCollapsed = false,
}: SidebarProps) {
  // Separate pinned and regular conversations
  const pinnedConversations = conversations.filter((c) => c.is_pinned);
  const recentConversations = conversations
    .filter((c) => !c.is_pinned)
    .slice(0, 8);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "h-full flex flex-col bg-dark-950 border-r border-dark-800/30",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header with logo */}
        <div className="p-4 border-b border-dark-800/30">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="/scio-logo.png"
                alt="Scio Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-white">Scio</span>
            )}
          </div>
        </div>

        {/* Search bar */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-900/60 border border-dark-800/50">
              <Search className="w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-sm text-dark-300 placeholder:text-dark-600 outline-none flex-1"
              />
            </div>
          </div>
        )}

        {/* Main Menu */}
        <div className="px-2 py-2 border-b border-dark-800/30">
          {!isCollapsed && (
            <p className="px-2 py-1.5 text-[10px] font-medium text-dark-600 uppercase tracking-wider">
              Main Menu
            </p>
          )}

          {/* New Chat button */}
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-800/50 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">New Chat</span>}
          </button>

          {/* Menu items */}
          {!isCollapsed &&
            MENU_SECTIONS.slice(0, 2).map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-dark-400 hover:bg-dark-800/50 hover:text-dark-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.hasChevron && <ChevronDown className="w-3 h-3" />}
              </button>
            ))}
        </div>

        {/* Chat section - Recent conversations */}
        <div className="px-2 py-2 border-b border-dark-800/30 flex-1 min-h-0">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-[10px] font-medium text-dark-600 uppercase tracking-wider">
                Chat
              </p>
              <ChevronDown className="w-3 h-3 text-dark-600" />
            </div>
          )}

          <ScrollArea className="h-full max-h-[40vh]">
            <div className="space-y-0.5">
              {pinnedConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  isCollapsed={isCollapsed}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onDelete={() => onDeleteConversation(conversation.id)}
                  onPin={() => onPinConversation(conversation.id)}
                />
              ))}
              {recentConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  isCollapsed={isCollapsed}
                  onSelect={() => onSelectConversation(conversation.id)}
                  onDelete={() => onDeleteConversation(conversation.id)}
                  onPin={() => onPinConversation(conversation.id)}
                />
              ))}
              {conversations.length === 0 && !isCollapsed && (
                <p className="px-3 py-4 text-xs text-dark-600 text-center">
                  No conversations yet
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Bottom section - Upgrade prompt */}
        {!isCollapsed && (
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
        {!isCollapsed && (
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
