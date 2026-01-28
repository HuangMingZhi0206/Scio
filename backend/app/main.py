"""
Scio IT Helpdesk RAG Chatbot - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import init_db
from app.models import HealthResponse
from app.routers import chat, knowledge, finetune

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    print("=" * 50)
    print(f"  {settings.app_name} - {settings.app_description}")
    print(f"  Version: {settings.app_version}")
    print("=" * 50)
    
    # Initialize database
    print("Initializing database...")
    init_db()
    print("Database initialized!")
    
    # Pre-load services (optional - can be lazy loaded)
    print("Pre-loading services...")
    try:
        from app.services.embeddings import get_embedding_service
        from app.services.vectordb import get_vectordb_service
        from app.services.llm import get_llm_service
        
        get_embedding_service()
        get_vectordb_service()
        get_llm_service()
        print("Services loaded!")
    except Exception as e:
        print(f"Warning: Could not pre-load some services: {e}")
    
    print("\nServer is ready!")
    print(f"API docs available at: http://{settings.host}:{settings.port}/docs\n")
    
    yield
    
    # Shutdown
    print("\nShutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(knowledge.router)
app.include_router(finetune.router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "description": settings.app_description,
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    from app.services.llm import get_llm_service
    from app.services.vectordb import get_vectordb_service
    
    llm_service = get_llm_service()
    vectordb_service = get_vectordb_service()
    
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        ollama_connected=llm_service.is_connected(),
        chromadb_connected=vectordb_service.is_connected()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
