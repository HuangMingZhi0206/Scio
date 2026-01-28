"""
Fine-tuning Service for Scio IT Helpdesk
Creates custom Ollama models using Modelfile approach.
"""
import os
import subprocess
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
import ollama

from app.config import get_settings

settings = get_settings()


class FineTuneService:
    """Service for creating and managing custom Ollama models."""
    
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent.parent / "models"
        self.models_dir.mkdir(exist_ok=True)
        self.default_modelfile = self.models_dir / "Modelfile.helpdesk"
    
    def get_modelfile_content(
        self, 
        base_model: str = "llama3.2:3b", 
        custom_prompt: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 0.9,
        num_ctx: int = 4096
    ) -> str:
        """Generate Modelfile content with custom parameters."""
        system_prompt = custom_prompt or self._get_default_system_prompt()
        
        return f'''FROM {base_model}

# IT Helpdesk specialized model parameters
PARAMETER temperature {temperature}
PARAMETER top_p {top_p}
PARAMETER top_k 40
PARAMETER num_ctx {num_ctx}

# System prompt for IT Helpdesk assistant
SYSTEM """{system_prompt}"""
'''
    
    def _get_default_system_prompt(self) -> str:
        """Get default IT Helpdesk system prompt."""
        return """You are SCIO, an expert IT Helpdesk Assistant specialized in technical support.

## Your Expertise:
- Computer hardware troubleshooting and maintenance
- Operating systems (Windows, Linux, macOS)
- Networking and connectivity issues
- Software installation and configuration
- Error code interpretation
- Security and data protection
- IT best practices

## Response Guidelines:
1. Be concise and professional
2. Provide step-by-step solutions when applicable
3. Explain technical concepts in simple terms
4. Always prioritize data safety
5. Recommend consulting IT professionals for complex hardware issues

## Important Rules:
- ONLY answer IT/Technology related questions
- For non-IT topics, politely redirect to appropriate resources
- Never provide medical, legal, or financial advice
- When unsure, recommend seeking professional IT support

You are helpful, accurate, and focused on solving IT problems efficiently."""
    
    def create_model(
        self,
        model_name: str,
        base_model: str = "llama3.2:3b",
        custom_prompt: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 0.9,
        num_ctx: int = 4096
    ) -> Dict[str, Any]:
        """
        Create a custom Ollama model using Modelfile.
        
        Args:
            model_name: Name for the new model
            base_model: Base model to use (e.g., llama3.2:3b)
            custom_prompt: Optional custom system prompt
            temperature: Generation temperature (0.0-1.0)
            top_p: Top P sampling parameter (0.1-1.0)
            num_ctx: Context window size
            
        Returns:
            Dict with status and model info
        """
        try:
            # Generate Modelfile content with custom parameters
            modelfile_content = self.get_modelfile_content(
                base_model, 
                custom_prompt,
                temperature,
                top_p,
                num_ctx
            )
            
            # Save Modelfile
            modelfile_path = self.models_dir / f"Modelfile.{model_name}"
            with open(modelfile_path, "w", encoding="utf-8") as f:
                f.write(modelfile_content)
            
            # Create model using Ollama CLI subprocess
            # This is more reliable across different ollama-python versions
            result = subprocess.run(
                ["ollama", "create", model_name, "-f", str(modelfile_path)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                raise Exception(f"Ollama create failed: {result.stderr}")
            
            return {
                "success": True,
                "model_name": model_name,
                "base_model": base_model,
                "modelfile_path": str(modelfile_path),
                "created_at": datetime.now().isoformat(),
                "message": f"Model '{model_name}' created successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create model: {str(e)}"
            }
    
    def list_custom_models(self) -> List[Dict[str, Any]]:
        """List all custom models created by this service."""
        custom_models = []
        
        try:
            result = ollama.list()
            models_list = result.models if hasattr(result, 'models') else []
            
            for model in models_list:
                model_name = model.model if hasattr(model, 'model') else str(model)
                # Check if it's a custom model (has corresponding Modelfile)
                modelfile_path = self.models_dir / f"Modelfile.{model_name.split(':')[0]}"
                
                if modelfile_path.exists() or model_name.startswith("scio"):
                    custom_models.append({
                        "name": model_name,
                        "size": getattr(model, 'size', 0),
                        "modified_at": str(getattr(model, 'modified_at', '')),
                        "is_custom": True
                    })
                    
        except Exception as e:
            pass
            
        return custom_models
    
    def delete_model(self, model_name: str) -> Dict[str, Any]:
        """Delete a custom model."""
        try:
            ollama.delete(model=model_name)
            
            # Remove Modelfile if exists
            modelfile_path = self.models_dir / f"Modelfile.{model_name.split(':')[0]}"
            if modelfile_path.exists():
                modelfile_path.unlink()
            
            return {
                "success": True,
                "message": f"Model '{model_name}' deleted successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete model: {str(e)}"
            }
    
    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific model."""
        try:
            info = ollama.show(model=model_name)
            return {
                "name": model_name,
                "parameters": info.get("parameters", {}),
                "template": info.get("template", ""),
                "modelfile": info.get("modelfile", ""),
            }
        except Exception as e:
            return None


# Singleton instance
_finetune_service = None


def get_finetune_service() -> FineTuneService:
    """Get or create FineTuneService instance."""
    global _finetune_service
    if _finetune_service is None:
        _finetune_service = FineTuneService()
    return _finetune_service
