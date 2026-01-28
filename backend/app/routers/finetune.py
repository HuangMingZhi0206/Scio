"""
Fine-tuning API Router for Scio IT Helpdesk
Provides endpoints for creating and managing custom models.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List

from app.services.finetune import get_finetune_service


router = APIRouter(prefix="/finetune", tags=["Fine-tuning"])


class CreateModelRequest(BaseModel):
    """Request model for creating a custom model."""
    name: str = Field(..., min_length=1, max_length=50, description="Name for the new model")
    base_model: str = Field(default="llama3:8b", description="Base model to use")
    custom_prompt: Optional[str] = Field(None, description="Optional custom system prompt")


class ModelResponse(BaseModel):
    """Response model for model operations."""
    success: bool
    message: str
    model_name: Optional[str] = None
    error: Optional[str] = None


class CustomModelInfo(BaseModel):
    """Information about a custom model."""
    name: str
    size: int
    modified_at: str
    is_custom: bool


@router.post("/create-model", response_model=ModelResponse)
async def create_custom_model(request: CreateModelRequest):
    """
    Create a new custom model based on the specified base model.
    
    This creates an Ollama model with IT Helpdesk-specific system prompts
    and optimized parameters.
    """
    service = get_finetune_service()
    result = service.create_model(
        model_name=request.name,
        base_model=request.base_model,
        custom_prompt=request.custom_prompt
    )
    
    if result["success"]:
        return ModelResponse(
            success=True,
            message=result["message"],
            model_name=result["model_name"]
        )
    else:
        return ModelResponse(
            success=False,
            message=result["message"],
            error=result.get("error")
        )


@router.get("/models", response_model=List[CustomModelInfo])
async def list_custom_models():
    """
    List all custom models created by the fine-tuning service.
    """
    service = get_finetune_service()
    models = service.list_custom_models()
    return [CustomModelInfo(**m) for m in models]


@router.delete("/models/{model_name}")
async def delete_custom_model(model_name: str):
    """
    Delete a custom model.
    """
    service = get_finetune_service()
    result = service.delete_model(model_name)
    
    if result["success"]:
        return {"success": True, "message": result["message"]}
    else:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to delete model"))


@router.get("/available-base-models")
async def list_available_base_models():
    """
    List available base models that can be used for fine-tuning.
    """
    import ollama
    
    try:
        result = ollama.list()
        models_list = result.models if hasattr(result, 'models') else []
        
        base_models = []
        for model in models_list:
            model_name = model.model if hasattr(model, 'model') else str(model)
            # Exclude custom models (those with scio prefix)
            if not model_name.startswith("scio"):
                base_models.append({
                    "name": model_name,
                    "size": getattr(model, 'size', 0),
                })
        
        return {"models": base_models}
    except Exception as e:
        return {"models": [], "error": str(e)}
