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
import ollama

from app.database import get_db, ConversationDB, MessageDB
from app.models import (
    ChatRequest, ChatResponse, ChatMessage, MessageRole,
    FeedbackRequest, FeedbackType, SourceDocument,
    Conversation, ConversationDetail, ConversationListResponse
)
from app.services.rag import get_rag_service
from app.services.llm import get_llm_service
from app.services.gemini import get_gemini_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/models")
async def list_available_models():
    """
    List available models (Ollama + Gemini).
    """
    available_models = []
    
    # Add Gemini models first (cloud models)
    gemini_models = [
        {"name": "models/gemini-2.0-flash", "size": 0, "modified_at": "", "provider": "gemini"},
        {"name": "models/gemini-2.5-flash", "size": 0, "modified_at": "", "provider": "gemini"},
        {"name": "models/gemini-flash-latest", "size": 0, "modified_at": "", "provider": "gemini"},
    ]
    available_models.extend(gemini_models)
    
    # Add Ollama models
    try:
        result = ollama.list()
        models_list = result.models if hasattr(result, 'models') else result.get('models', [])
        for model in models_list:
            if hasattr(model, 'model'):
                model_name = model.model
                model_size = getattr(model, 'size', 0) or 0
                modified_at = str(getattr(model, 'modified_at', ''))
            else:
                model_name = model.get('name', '') or model.get('model', '')
                model_size = model.get('size', 0)
                modified_at = str(model.get('modified_at', ''))
            
            if model_name:
                available_models.append({
                    "name": model_name,
                    "size": model_size,
                    "modified_at": modified_at,
                    "provider": "ollama"
                })
    except Exception as e:
        print(f"Ollama list error: {e}")
    
    return {"models": available_models}


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
            conversation_history=conversation_history,
            model=request.model
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
    
    if len(history_messages) == 0:
        try:
            title = llm_service.generate_title(request.message, model=request.model)
            conversation.title = title
        except Exception:
            conversation.title = request.message[:50] + "..." if len(request.message) > 50 else request.message
    
    conversation.updated_at = datetime.now()
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
    If feedback is thumbs_up, the Q&A pair is added to the knowledge base
    so the chatbot can learn from successful interactions.
    """
    message = db.query(MessageDB).filter(
        MessageDB.id == request.message_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.feedback = request.feedback.value
    db.commit()
    
    learned = False
    
    # If thumbs up, add Q&A pair to knowledge base for learning
    if request.feedback.value == "thumbs_up":
        # Get the previous user message (the question)
        prev_messages = db.query(MessageDB).filter(
            MessageDB.conversation_id == message.conversation_id,
            MessageDB.timestamp < message.timestamp,
            MessageDB.role == "user"
        ).order_by(MessageDB.timestamp.desc()).first()
        
        if prev_messages:
            question = prev_messages.content
            answer = message.content
            
            # Add to knowledge base
            learned = rag_service.add_learned_qa(
                question=question,
                answer=answer,
                message_id=message.id
            )
    
    return {
        "success": True, 
        "message": "Feedback recorded",
        "learned": learned
    }


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List all conversations with pinned first.
    """
    total = db.query(ConversationDB).count()
    
    # Sort by pinned first, then by updated_at
    conversations = db.query(ConversationDB).order_by(
        ConversationDB.is_pinned.desc(),
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
            is_pinned=conv.is_pinned or False,
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


@router.patch("/conversations/{conversation_id}/pin")
async def toggle_pin_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    Toggle pin status of a conversation.
    """
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.is_pinned = not (conversation.is_pinned or False)
    db.commit()
    
    return {"success": True, "is_pinned": conversation.is_pinned}
