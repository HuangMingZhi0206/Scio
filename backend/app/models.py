"""
Pydantic models for Scio API
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Message role enum."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class FeedbackType(str, Enum):
    """Feedback type enum."""
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"


# ============== Request Models ==============

class ChatRequest(BaseModel):
    """Chat message request."""
    message: str = Field(..., min_length=1, max_length=4000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    model: Optional[str] = Field(None, description="Ollama model to use (e.g., llama3.2:3b, llama3)")


class FeedbackRequest(BaseModel):
    """Feedback submission request."""
    message_id: str = Field(..., description="Message ID to rate")
    feedback: FeedbackType = Field(..., description="Thumbs up or down")


class IngestRequest(BaseModel):
    """Data ingestion request."""
    force_reingest: bool = Field(False, description="Force re-ingestion of all data")


# ============== Response Models ==============

class SourceDocument(BaseModel):
    """Source document reference."""
    content: str = Field(..., description="Document content snippet")
    source: str = Field(..., description="Source file name")
    metadata: dict = Field(default_factory=dict, description="Additional metadata")
    relevance_score: Optional[float] = Field(None, description="Similarity score")


class ChatMessage(BaseModel):
    """Chat message."""
    id: str = Field(..., description="Message ID")
    role: MessageRole = Field(..., description="Message role")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(..., description="Message timestamp")
    sources: Optional[List[SourceDocument]] = Field(None, description="Source documents (for assistant)")
    feedback: Optional[FeedbackType] = Field(None, description="User feedback")
    is_critical: bool = Field(False, description="Contains critical issue keywords")


class ChatResponse(BaseModel):
    """Chat response."""
    message: ChatMessage = Field(..., description="Assistant response message")
    conversation_id: str = Field(..., description="Conversation ID")


class Conversation(BaseModel):
    """Conversation summary."""
    id: str = Field(..., description="Conversation ID")
    title: str = Field(..., description="Conversation title")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    message_count: int = Field(0, description="Number of messages")


class ConversationDetail(BaseModel):
    """Detailed conversation with messages."""
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage] = Field(default_factory=list)


class ConversationListResponse(BaseModel):
    """List of conversations."""
    conversations: List[Conversation] = Field(default_factory=list)
    total: int = Field(0, description="Total conversation count")


class KnowledgeStats(BaseModel):
    """Knowledge base statistics."""
    total_documents: int = Field(0, description="Total documents in vector DB")
    last_ingestion: Optional[datetime] = Field(None, description="Last ingestion time")
    sources: dict = Field(default_factory=dict, description="Document count by source")


class IngestResponse(BaseModel):
    """Ingestion response."""
    success: bool
    message: str
    documents_processed: int = 0
    errors: List[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str = "1.0.0"
    ollama_connected: bool = False
    chromadb_connected: bool = False


# ============== Error Models ==============

class ErrorResponse(BaseModel):
    """Error response."""
    detail: str
    error_code: Optional[str] = None
