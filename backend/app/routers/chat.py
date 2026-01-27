"""
Chat API Router
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import uuid
import json

from app.database import get_db, ConversationDB, MessageDB
from app.models import (
    ChatRequest, ChatResponse, ChatMessage, MessageRole,
    FeedbackRequest, FeedbackType, SourceDocument,
    Conversation, ConversationDetail, ConversationListResponse
)
from app.services.rag import get_rag_service
from app.services.llm import get_llm_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message and get a RAG-powered response.
    """
    rag_service = get_rag_service()
    llm_service = get_llm_service()
    
    # Get or create conversation
    conversation_id = request.conversation_id
    conversation = None
    
    if conversation_id:
        conversation = db.query(ConversationDB).filter(
            ConversationDB.id == conversation_id
        ).first()
    
    if not conversation:
        # Create new conversation
        conversation_id = str(uuid.uuid4())
        conversation = ConversationDB(
            id=conversation_id,
            title="New Conversation"
        )
        db.add(conversation)
        db.commit()
    
    # Get conversation history
    history_messages = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id
    ).order_by(MessageDB.timestamp.asc()).all()
    
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]
    
    # Save user message
    user_message = MessageDB(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role=MessageRole.USER.value,
        content=request.message
    )
    db.add(user_message)
    
    # Generate RAG response
    try:
        response_text, sources, is_critical = rag_service.generate_response(
            query=request.message,
            conversation_history=conversation_history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
    
    # Save assistant message
    assistant_message_id = str(uuid.uuid4())
    assistant_message = MessageDB(
        id=assistant_message_id,
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT.value,
        content=response_text,
        sources_json=json.dumps([s.model_dump() for s in sources]) if sources else None,
        is_critical=is_critical
    )
    db.add(assistant_message)
    
    # Update conversation title if first message
    if len(history_messages) == 0:
        try:
            title = llm_service.generate_title(request.message)
            conversation.title = title
        except Exception:
            conversation.title = request.message[:50] + "..." if len(request.message) > 50 else request.message
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    
    # Build response
    chat_message = ChatMessage(
        id=assistant_message_id,
        role=MessageRole.ASSISTANT,
        content=response_text,
        timestamp=assistant_message.timestamp,
        sources=sources,
        is_critical=is_critical
    )
    
    return ChatResponse(
        message=chat_message,
        conversation_id=conversation_id
    )


@router.post("/stream")
async def send_message_stream(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Send a message and get a streaming RAG response.
    """
    rag_service = get_rag_service()
    
    # Get or create conversation
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        conversation = ConversationDB(id=conversation_id)
        db.add(conversation)
        db.commit()
    
    # Get history
    history_messages = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id
    ).order_by(MessageDB.timestamp.asc()).all()
    
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]
    
    async def generate():
        full_response = ""
        for chunk in rag_service.generate_response_stream(
            query=request.message,
            conversation_history=conversation_history
        ):
            full_response += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield f"data: {json.dumps({'done': True, 'conversation_id': conversation_id})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback for a message.
    """
    message = db.query(MessageDB).filter(
        MessageDB.id == request.message_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.feedback = request.feedback.value
    db.commit()
    
    return {"success": True, "message": "Feedback recorded"}


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List all conversations.
    """
    total = db.query(ConversationDB).count()
    
    conversations = db.query(ConversationDB).order_by(
        ConversationDB.updated_at.desc()
    ).offset(offset).limit(limit).all()
    
    result = []
    for conv in conversations:
        msg_count = db.query(MessageDB).filter(
            MessageDB.conversation_id == conv.id
        ).count()
        
        result.append(Conversation(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=msg_count
        ))
    
    return ConversationListResponse(conversations=result, total=total)


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a conversation with all messages.
    """
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id
    ).order_by(MessageDB.timestamp.asc()).all()
    
    chat_messages = []
    for msg in messages:
        sources = None
        if msg.sources_json:
            try:
                sources_data = json.loads(msg.sources_json)
                sources = [SourceDocument(**s) for s in sources_data]
            except Exception:
                pass
        
        chat_messages.append(ChatMessage(
            id=msg.id,
            role=MessageRole(msg.role),
            content=msg.content,
            timestamp=msg.timestamp,
            sources=sources,
            feedback=FeedbackType(msg.feedback) if msg.feedback else None,
            is_critical=msg.is_critical or False
        ))
    
    return ConversationDetail(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=chat_messages
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a conversation.
    """
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    return {"success": True, "message": "Conversation deleted"}
