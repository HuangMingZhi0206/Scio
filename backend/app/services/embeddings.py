"""
Sentence Transformer Embedding Service
"""
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from functools import lru_cache

from app.config import get_settings

settings = get_settings()


class EmbeddingService:
    """Service for generating text embeddings using Sentence Transformers."""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            print(f"Loading embedding model: {settings.embedding_model}")
            self._model = SentenceTransformer(settings.embedding_model)
            self.dimension = self._model.get_sentence_embedding_dimension()
            print(f"Embedding dimension: {self.dimension}")
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of floats representing the embedding
        """
        embedding = self._model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of input texts
            
        Returns:
            List of embeddings
        """
        embeddings = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
        return embeddings.tolist()
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Cosine similarity score (0-1)
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))


@lru_cache()
def get_embedding_service() -> EmbeddingService:
    """Get cached embedding service instance."""
    return EmbeddingService()
