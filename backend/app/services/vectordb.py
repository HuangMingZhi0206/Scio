"""
ChromaDB Vector Database Service
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Optional, Dict, Any
from functools import lru_cache

from app.config import get_settings
from app.services.embeddings import get_embedding_service

settings = get_settings()


class VectorDBService:
    """Service for ChromaDB vector database operations."""
    
    _instance = None
    _client = None
    _collection = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._init_client()
    
    def _init_client(self):
        """Initialize ChromaDB client."""
        try:
            print("Connecting to ChromaDB Cloud...")
            self._client = chromadb.CloudClient(
                api_key=settings.chromadb_api_key,
                tenant=settings.chromadb_tenant,
                database=settings.chromadb_database
            )
            self._get_or_create_collection()
            print("ChromaDB connected successfully!")
        except Exception as e:
            print(f"Failed to connect to ChromaDB Cloud: {e}")
            print("Falling back to local ChromaDB...")
            # Fallback to local persistent storage
            self._client = chromadb.PersistentClient(path="./data/chromadb")
            self._get_or_create_collection()
            print("Local ChromaDB initialized!")
    
    def _get_or_create_collection(self):
        """Get or create the knowledge base collection."""
        embedding_service = get_embedding_service()
        self._collection = self._client.get_or_create_collection(
            name=settings.chromadb_collection,
            metadata={"dimension": embedding_service.dimension}
        )
    
    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ) -> int:
        """
        Add documents to the vector database.
        
        Args:
            documents: List of document texts
            metadatas: List of metadata dicts
            ids: List of unique document IDs
            
        Returns:
            Number of documents added
        """
        if not documents:
            return 0
        
        embedding_service = get_embedding_service()
        embeddings = embedding_service.embed_texts(documents)
        
        # ChromaDB has a batch limit, so we process in chunks
        batch_size = 100
        total_added = 0
        
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i + batch_size]
            batch_embeddings = embeddings[i:i + batch_size]
            batch_metadatas = metadatas[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]
            
            self._collection.upsert(
                documents=batch_docs,
                embeddings=batch_embeddings,
                metadatas=batch_metadatas,
                ids=batch_ids
            )
            total_added += len(batch_docs)
            print(f"Added batch: {total_added}/{len(documents)} documents")
        
        return total_added
    
    def search(
        self,
        query: str,
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents.
        
        Args:
            query: Search query text
            top_k: Number of results to return
            filter_metadata: Optional metadata filter
            
        Returns:
            List of search results with document, metadata, and score
        """
        embedding_service = get_embedding_service()
        query_embedding = embedding_service.embed_text(query)
        
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=filter_metadata,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results
        formatted_results = []
        if results and results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                distance = results["distances"][0][i] if results["distances"] else 0.0
                # Convert L2 distance to similarity score (0-1 range)
                # Using 1/(1+distance) for proper normalization
                relevance_score = 1 / (1 + distance)
                formatted_results.append({
                    "content": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": distance,
                    "relevance_score": relevance_score,
                    "source": results["metadatas"][0][i].get("source", "unknown") if results["metadatas"] else "unknown"
                })
        
        return formatted_results
    
    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics."""
        count = self._collection.count()
        return {
            "total_documents": count,
            "collection_name": settings.chromadb_collection
        }
    
    def delete_all(self):
        """Delete all documents in the collection."""
        # Get all IDs and delete them
        all_data = self._collection.get()
        if all_data and all_data["ids"]:
            self._collection.delete(ids=all_data["ids"])
            print(f"Deleted {len(all_data['ids'])} documents")
    
    def is_connected(self) -> bool:
        """Check if ChromaDB is connected."""
        try:
            self._collection.count()
            return True
        except Exception:
            return False


@lru_cache()
def get_vectordb_service() -> VectorDBService:
    """Get cached vector DB service instance."""
    return VectorDBService()
