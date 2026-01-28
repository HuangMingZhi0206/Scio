"""
Ollama LLM Service
"""
import ollama
from typing import Generator, Optional
from functools import lru_cache

from app.config import get_settings, SYSTEM_PROMPT

settings = get_settings()


class LLMService:
    """Service for Ollama LLM operations."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.model = settings.ollama_model
        self.host = settings.ollama_host
        # Set the host for ollama client
        ollama.Client(host=self.host)
    
    def generate(
        self,
        user_message: str,
        context: str,
        conversation_history: Optional[list] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Generate a response using the LLM.
        
        Args:
            user_message: User's question
            context: Retrieved context from knowledge base
            conversation_history: Previous messages in conversation
            
        Returns:
            LLM response text
        """
        # Build system prompt with context
        system_message = SYSTEM_PROMPT.format(context=context)
        
        # Build messages list
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        try:
            use_model = model or self.model
            response = ollama.chat(
                model=use_model,
                messages=messages,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 1024,
                }
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"Ollama error: {e}")
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def generate_stream(
        self,
        user_message: str,
        context: str,
        conversation_history: Optional[list] = None,
        model: Optional[str] = None
    ) -> Generator[str, None, None]:
        """
        Generate a streaming response using the LLM.
        
        Args:
            user_message: User's question
            context: Retrieved context from knowledge base
            conversation_history: Previous messages
            
        Yields:
            Response chunks
        """
        system_message = SYSTEM_PROMPT.format(context=context)
        
        messages = [{"role": "system", "content": system_message}]
        
        if conversation_history:
            for msg in conversation_history[-6:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            use_model = model or self.model
            stream = ollama.chat(
                model=use_model,
                messages=messages,
                stream=True,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 1024,
                }
            )
            
            for chunk in stream:
                if chunk and "message" in chunk and "content" in chunk["message"]:
                    yield chunk["message"]["content"]
        except Exception as e:
            print(f"Ollama streaming error: {e}")
            yield f"Error: Failed to generate response - {str(e)}"
    
    def generate_title(self, first_message: str, model: Optional[str] = None) -> str:
        """
        Generate a conversation title from the first message.
        
        Args:
            first_message: First user message in conversation
            
        Returns:
            Short title for the conversation
        """
        try:
            use_model = model or self.model
            response = ollama.chat(
                model=use_model,
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a very short title (max 5 words) for this IT support conversation. Only respond with the title, nothing else."
                    },
                    {"role": "user", "content": first_message}
                ],
                options={"temperature": 0.3, "num_predict": 20}
            )
            title = response["message"]["content"].strip()
            # Clean up title
            title = title.replace('"', '').replace("'", "")[:50]
            return title if title else "IT Support Query"
        except Exception:
            return "IT Support Query"
    
    def is_connected(self) -> bool:
        """Check if Ollama is connected."""
        try:
            ollama.list()
            return True
        except Exception:
            return False


@lru_cache()
def get_llm_service() -> LLMService:
    """Get cached LLM service instance."""
    return LLMService()
