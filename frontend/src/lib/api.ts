/**
 * API Client for Scio Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SourceDocument {
    content: string;
    source: string;
    metadata: Record<string, any>;
    relevance_score?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    sources?: SourceDocument[];
    feedback?: 'thumbs_up' | 'thumbs_down';
    is_critical?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
}

export interface ConversationDetail {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: ChatMessage[];
}

export interface ChatResponse {
    message: ChatMessage;
    conversation_id: string;
}

export interface HealthResponse {
    status: string;
    version: string;
    ollama_connected: boolean;
    chromadb_connected: boolean;
}

export interface KnowledgeStats {
    total_documents: number;
    last_ingestion?: string;
    sources: Record<string, any>;
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new ApiError(response.status, error.detail || 'Request failed');
    }
    return response.json();
}

export const api = {
    // Health check
    async health(): Promise<HealthResponse> {
        const response = await fetch(`${API_BASE}/health`);
        return handleResponse<HealthResponse>(response);
    },

    // Chat endpoints
    async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
            }),
        });
        return handleResponse<ChatResponse>(response);
    },

    async submitFeedback(messageId: string, feedback: 'thumbs_up' | 'thumbs_down'): Promise<void> {
        const response = await fetch(`${API_BASE}/chat/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_id: messageId, feedback }),
        });
        await handleResponse<{ success: boolean }>(response);
    },

    // Conversation endpoints
    async getConversations(limit = 50, offset = 0): Promise<{ conversations: Conversation[]; total: number }> {
        const response = await fetch(`${API_BASE}/chat/conversations?limit=${limit}&offset=${offset}`);
        return handleResponse(response);
    },

    async getConversation(conversationId: string): Promise<ConversationDetail> {
        const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}`);
        return handleResponse<ConversationDetail>(response);
    },

    async deleteConversation(conversationId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
            method: 'DELETE',
        });
        await handleResponse<{ success: boolean }>(response);
    },

    // Knowledge base endpoints
    async getKnowledgeStats(): Promise<KnowledgeStats> {
        const response = await fetch(`${API_BASE}/knowledge/stats`);
        return handleResponse<KnowledgeStats>(response);
    },

    async ingestData(forceReingest = false): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/knowledge/ingest/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ force_reingest: forceReingest }),
        });
        return handleResponse(response);
    },
};

export default api;
