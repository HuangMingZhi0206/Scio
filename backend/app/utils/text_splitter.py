"""
Text Splitter Utilities
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict, Any

from app.config import get_settings

settings = get_settings()


def create_text_splitter(
    chunk_size: int = None,
    chunk_overlap: int = None
) -> RecursiveCharacterTextSplitter:
    """
    Create a text splitter with specified parameters.
    
    Args:
        chunk_size: Maximum chunk size
        chunk_overlap: Overlap between chunks
        
    Returns:
        Configured text splitter
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size or settings.chunk_size,
        chunk_overlap=chunk_overlap or settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", ", ", " ", ""]
    )


def split_text(
    text: str,
    metadata: Dict[str, Any] = None,
    chunk_size: int = None,
    chunk_overlap: int = None
) -> List[Dict[str, Any]]:
    """
    Split text into chunks with metadata.
    
    Args:
        text: Input text to split
        metadata: Metadata to attach to each chunk
        chunk_size: Maximum chunk size
        chunk_overlap: Overlap between chunks
        
    Returns:
        List of dicts with 'content' and 'metadata' keys
    """
    splitter = create_text_splitter(chunk_size, chunk_overlap)
    chunks = splitter.split_text(text)
    
    result = []
    for i, chunk in enumerate(chunks):
        chunk_metadata = (metadata or {}).copy()
        chunk_metadata["chunk_index"] = i
        chunk_metadata["total_chunks"] = len(chunks)
        
        result.append({
            "content": chunk,
            "metadata": chunk_metadata
        })
    
    return result


def split_documents(
    documents: List[Dict[str, Any]],
    text_key: str = "content",
    chunk_size: int = None,
    chunk_overlap: int = None
) -> List[Dict[str, Any]]:
    """
    Split multiple documents into chunks.
    
    Args:
        documents: List of document dicts
        text_key: Key containing the text to split
        chunk_size: Maximum chunk size
        chunk_overlap: Overlap between chunks
        
    Returns:
        List of chunked documents
    """
    all_chunks = []
    
    for doc in documents:
        text = doc.get(text_key, "")
        if not text:
            continue
        
        # Get metadata (everything except the text)
        metadata = {k: v for k, v in doc.items() if k != text_key}
        
        chunks = split_text(text, metadata, chunk_size, chunk_overlap)
        all_chunks.extend(chunks)
    
    return all_chunks
