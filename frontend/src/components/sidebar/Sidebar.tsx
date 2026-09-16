"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Pencil,
  MoreHorizontal,
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
  onRenameConversation: (id: string, title: string) => void;
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
  onRenameConversation,
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
                  onRename={(title) => onRenameConversation(conversation.id, title)}
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
                  onRename={(title) => onRenameConversation(conversation.id, title)}
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
  onRename: (title: string) => void;
}

function ConversationItem({
  conversation,
  isActive,
  isCollapsed,
  onSelect,
  onDelete,
  onPin,
  onRename,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).closest("button")?.getBoundingClientRect();
    if (rect) {
      setMenuPos({ x: rect.right, y: rect.top });
    }
    setShowMenu(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onPin();
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setRenameValue(conversation.title);
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
    }
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
    <>
      <div
        onClick={onSelect}
        onContextMenu={handleContextMenu}
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

        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm bg-dark-800 border border-cyan-500/50 rounded px-1.5 py-0.5 text-white outline-none focus:ring-1 focus:ring-cyan-500/50 min-w-0"
          />
        ) : (
          <span className="text-sm truncate flex-1">{conversation.title}</span>
        )}

        {/* More button - visible on hover */}
        {!isRenaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleMoreClick}
              className="p-1 rounded hover:bg-dark-700 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-dark-500" />
            </button>
          </div>
        )}
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed z-[100] min-w-[160px] py-1.5 rounded-lg bg-dark-900 border border-dark-700/80 shadow-xl shadow-black/40 backdrop-blur-xl animate-fade-in"
          style={{
            left: Math.min(menuPos.x, window.innerWidth - 180),
            top: Math.min(menuPos.y, window.innerHeight - 160),
          }}
        >
          <button
            onClick={handlePin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800/80 hover:text-white transition-colors"
          >
            <Pin className={cn("w-3.5 h-3.5", conversation.is_pinned ? "text-cyan-400" : "")} />
            {conversation.is_pinned ? "Unpin" : "Pin"}
          </button>
          <button
            onClick={handleStartRename}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-dark-300 hover:bg-dark-800/80 hover:text-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Rename
          </button>
          <div className="my-1 border-t border-dark-700/50" />
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </>
  );
}

export default Sidebar;
