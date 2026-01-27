"""
Knowledge Base API Router
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from datetime import datetime
from typing import Optional

from app.models import IngestRequest, IngestResponse, KnowledgeStats
from app.services.vectordb import get_vectordb_service
from app.utils.data_loader import load_all_datasets
from app.config import get_settings

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

settings = get_settings()

# Track ingestion status
ingestion_status = {
    "in_progress": False,
    "last_ingestion": None,
    "last_error": None,
    "documents_count": 0
}


def run_ingestion(force_reingest: bool = False):
    """
    Background task to run data ingestion.
    """
    global ingestion_status
    
    ingestion_status["in_progress"] = True
    ingestion_status["last_error"] = None
    
    try:
        vectordb = get_vectordb_service()
        
        # Clear existing data if force reingest
        if force_reingest:
            print("Force reingest: Clearing existing data...")
            vectordb.delete_all()
        
        # Load all datasets
        print("Loading datasets...")
        documents = load_all_datasets()
        
        if not documents:
            raise Exception("No documents loaded from datasets")
        
        # Extract data for ChromaDB
        doc_contents = [doc["content"] for doc in documents]
        doc_metadatas = [doc["metadata"] for doc in documents]
        doc_ids = [doc["id"] for doc in documents]
        
        # Add to vector database
        print("Adding documents to ChromaDB...")
        count = vectordb.add_documents(
            documents=doc_contents,
            metadatas=doc_metadatas,
            ids=doc_ids
        )
        
        ingestion_status["documents_count"] = count
        ingestion_status["last_ingestion"] = datetime.utcnow()
        print(f"Ingestion complete: {count} documents added")
        
    except Exception as e:
        ingestion_status["last_error"] = str(e)
        print(f"Ingestion failed: {e}")
    
    finally:
        ingestion_status["in_progress"] = False


@router.post("/ingest", response_model=IngestResponse)
async def ingest_data(
    request: IngestRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger knowledge base ingestion from datasets.
    """
    if ingestion_status["in_progress"]:
        return IngestResponse(
            success=False,
            message="Ingestion already in progress",
            documents_processed=0
        )
    
    # Run ingestion in background
    background_tasks.add_task(run_ingestion, request.force_reingest)
    
    return IngestResponse(
        success=True,
        message="Ingestion started in background. Check /knowledge/stats for progress.",
        documents_processed=0
    )


@router.post("/ingest/sync", response_model=IngestResponse)
async def ingest_data_sync(request: IngestRequest):
    """
    Trigger knowledge base ingestion synchronously (blocking).
    """
    if ingestion_status["in_progress"]:
        return IngestResponse(
            success=False,
            message="Ingestion already in progress",
            documents_processed=0
        )
    
    run_ingestion(request.force_reingest)
    
    if ingestion_status["last_error"]:
        return IngestResponse(
            success=False,
            message=f"Ingestion failed: {ingestion_status['last_error']}",
            documents_processed=0,
            errors=[ingestion_status["last_error"]]
        )
    
    return IngestResponse(
        success=True,
        message="Ingestion completed successfully",
        documents_processed=ingestion_status["documents_count"]
    )


@router.get("/stats", response_model=KnowledgeStats)
async def get_stats():
    """
    Get knowledge base statistics.
    """
    vectordb = get_vectordb_service()
    stats = vectordb.get_stats()
    
    return KnowledgeStats(
        total_documents=stats["total_documents"],
        last_ingestion=ingestion_status["last_ingestion"],
        sources={
            "status": "in_progress" if ingestion_status["in_progress"] else "idle",
            "last_error": ingestion_status["last_error"]
        }
    )


@router.delete("/clear")
async def clear_knowledge_base():
    """
    Clear all documents from the knowledge base.
    """
    if ingestion_status["in_progress"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot clear while ingestion is in progress"
        )
    
    try:
        vectordb = get_vectordb_service()
        vectordb.delete_all()
        
        ingestion_status["documents_count"] = 0
        
        return {"success": True, "message": "Knowledge base cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
