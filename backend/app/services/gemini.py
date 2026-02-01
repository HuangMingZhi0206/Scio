"""
Gemini LLM Service
"""
import google.generativeai as genai
from typing import Generator, Optional
from functools import lru_cache

from app.config import get_settings, SYSTEM_PROMPT

settings = get_settings()


class GeminiService:
    """Service for Google Gemini LLM operations."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.api_key = settings.gemini_api_key
            self.model_name = settings.gemini_model
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self._initialized = True
    
    def generate(
        self,
        user_message: str,
        context: str,
        conversation_history: Optional[list] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Generate a response using Gemini.
        
        Args:
            user_message: User's question
            context: Retrieved context from knowledge base
            conversation_history: Previous messages in conversation
            
        Returns:
            LLM response text
        """
        # Build system prompt with context
        system_message = SYSTEM_PROMPT.format(context=context)
        
        # Build conversation as a single prompt
        full_prompt = f"{system_message}\n\n"
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                role = "User" if msg["role"] == "user" else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n\n"
        
        # Add current user message
        full_prompt += f"User: {user_message}\n\nAssistant:"
        
        try:
            use_model = model if model and "gemini" in model else self.model_name
            if use_model != self.model_name:
                gen_model = genai.GenerativeModel(use_model)
            else:
                gen_model = self.model
                
            response = gen_model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    max_output_tokens=1024,
                )
            )
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            raise Exception(f"Failed to generate response: {str(e)}")
    
    def generate_stream(
        self,
        user_message: str,
        context: str,
        conversation_history: Optional[list] = None,
        model: Optional[str] = None
    ) -> Generator[str, None, None]:
        """
        Generate a streaming response using Gemini.
        
        Args:
            user_message: User's question
            context: Retrieved context from knowledge base
            conversation_history: Previous messages
            
        Yields:
            Response chunks
        """
        system_message = SYSTEM_PROMPT.format(context=context)
        
        full_prompt = f"{system_message}\n\n"
        
        if conversation_history:
            for msg in conversation_history[-6:]:
                role = "User" if msg["role"] == "user" else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n\n"
        
        full_prompt += f"User: {user_message}\n\nAssistant:"
        
        try:
            use_model = model if model and "gemini" in model else self.model_name
            if use_model != self.model_name:
                gen_model = genai.GenerativeModel(use_model)
            else:
                gen_model = self.model
                
            response = gen_model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    max_output_tokens=1024,
                ),
                stream=True
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            print(f"Gemini streaming error: {e}")
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
            prompt = f"Generate a very short title (max 5 words) for this IT support conversation. Only respond with the title, nothing else.\n\nUser message: {first_message}"
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=20,
                )
            )
            title = response.text.strip()
            # Clean up title
            title = title.replace('"', '').replace("'", "")[:50]
            return title if title else "IT Support Query"
        except Exception:
            return "IT Support Query"
    
    def is_connected(self) -> bool:
        """Check if Gemini API is connected."""
        try:
            # Quick test to verify API key works
            models = genai.list_models()
            return True
        except Exception:
            return False


@lru_cache()
def get_gemini_service() -> GeminiService:
    """Get cached Gemini service instance."""
    return GeminiService()
