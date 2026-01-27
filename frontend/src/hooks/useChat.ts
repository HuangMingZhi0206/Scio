"use client";

import { useState, useCallback, useEffect } from "react";
import api, { ChatMessage, Conversation, ConversationDetail } from "@/lib/api";
import { generateId } from "@/lib/utils";

interface UseChatReturn {
    // State
    messages: ChatMessage[];
    conversations: Conversation[];
    currentConversationId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    sendMessage: (content: string) => Promise<void>;
    startNewConversation: () => void;
    loadConversation: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    submitFeedback: (messageId: string, feedback: 'thumbs_up' | 'thumbs_down') => Promise<void>;
    refreshConversations: () => Promise<void>;
    clearError: () => void;
}

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load conversations on mount
    useEffect(() => {
        refreshConversations();
    }, []);

    const refreshConversations = useCallback(async () => {
        try {
            const data = await api.getConversations();
            setConversations(data.conversations);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        // Add optimistic user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: "user",
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const response = await api.sendMessage(content, currentConversationId || undefined);

            // Update conversation ID if new
            if (!currentConversationId) {
                setCurrentConversationId(response.conversation_id);
            }

            // Add assistant message
            setMessages((prev) => [...prev, response.message]);

            // Refresh conversation list
            await refreshConversations();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to send message";
            setError(errorMessage);

            // Remove optimistic user message on error
            setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        } finally {
            setIsLoading(false);
        }
    }, [currentConversationId, isLoading, refreshConversations]);

    const startNewConversation = useCallback(() => {
        setMessages([]);
        setCurrentConversationId(null);
        setError(null);
    }, []);

    const loadConversation = useCallback(async (conversationId: string) => {
        if (conversationId === currentConversationId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await api.getConversation(conversationId);
            setMessages(data.messages);
            setCurrentConversationId(conversationId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load conversation";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [currentConversationId]);

    const deleteConversation = useCallback(async (conversationId: string) => {
        try {
            await api.deleteConversation(conversationId);

            // If deleting current conversation, reset state
            if (conversationId === currentConversationId) {
                startNewConversation();
            }

            await refreshConversations();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete conversation";
            setError(errorMessage);
        }
    }, [currentConversationId, startNewConversation, refreshConversations]);

    const submitFeedback = useCallback(async (messageId: string, feedback: 'thumbs_up' | 'thumbs_down') => {
        try {
            await api.submitFeedback(messageId, feedback);

            // Update local message state
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, feedback } : m
                )
            );
        } catch (err) {
            console.error("Failed to submit feedback:", err);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
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
        refreshConversations,
        clearError,
    };
}
