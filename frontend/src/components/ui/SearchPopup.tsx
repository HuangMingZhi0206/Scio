"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MessageSquare, Clock } from "lucide-react";
import { Conversation } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export function SearchPopup({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
}: SearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/60 shadow-2xl overflow-hidden animate-fade-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-dark-800/50">
          <Search className="w-5 h-5 text-dark-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-white placeholder:text-dark-500 outline-none text-base"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="py-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-800/50 transition-colors text-left"
                >
                  <MessageSquare className="w-4 h-4 text-dark-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{conv.title}</p>
                    <p className="text-xs text-dark-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="py-8 text-center">
              <p className="text-dark-500 text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-dark-500 text-sm">
                Start typing to search conversations...
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-dark-800/50 flex items-center justify-between text-xs text-dark-600">
          <span>Press ESC to close</span>
          <span>{filteredConversations.length} conversations</span>
        </div>
      </div>
    </div>
  );
}

export default SearchPopup;
