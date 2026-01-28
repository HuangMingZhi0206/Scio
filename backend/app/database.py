"""
SQLite Database Setup for Chat History
"""
import os
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timezone
import uuid

from app.config import get_settings

settings = get_settings()

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

# Create engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


class ConversationDB(Base):
    """Conversation table."""
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), default="New Conversation")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationship
    messages = relationship("MessageDB", back_populates="conversation", cascade="all, delete-orphan")


class MessageDB(Base):
    """Message table."""
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    feedback = Column(String(20), nullable=True)  # thumbs_up, thumbs_down
    sources_json = Column(Text, nullable=True)  # JSON string of source documents
    is_critical = Column(Boolean, default=False)
    
    # Relationship
    conversation = relationship("ConversationDB", back_populates="messages")


class IngestionLogDB(Base):
    """Ingestion log table."""
    __tablename__ = "ingestion_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.now)
    source_file = Column(String(255), nullable=False)
    documents_count = Column(Integer, default=0)
    status = Column(String(50), default="success")  # success, failed
    error_message = Column(Text, nullable=True)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
