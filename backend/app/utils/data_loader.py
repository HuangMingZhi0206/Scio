"""
Data Loader Utilities for CSV, TXT, and PDF files
"""
import os
import csv
import hashlib
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.config import get_settings
from app.utils.text_splitter import split_text

settings = get_settings()


def generate_doc_id(content: str, source: str, index: int = 0) -> str:
    """Generate a unique document ID."""
    hash_input = f"{source}:{index}:{content[:100]}"
    return hashlib.md5(hash_input.encode()).hexdigest()


def load_csv_knowledge_items(file_path: str) -> List[Dict[str, Any]]:
    """
    Load knowledge items from synthetic_knowledge_items.csv.
    
    Expected columns: ki_topic, ki_text
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        List of document dicts with content and metadata
    """
    documents = []
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            topic = row.get('ki_topic', '').strip()
            text = row.get('ki_text', '').strip()
            
            if not text:
                continue
            
            # Combine topic and text for better context
            full_content = f"Topic: {topic}\n\n{text}" if topic else text
            
            doc_id = generate_doc_id(full_content, "knowledge_items", i)
            
            documents.append({
                "id": doc_id,
                "content": full_content,
                "metadata": {
                    "source": "synthetic_knowledge_items.csv",
                    "category": "Knowledge Base",
                    "topic": topic,
                    "row_index": i
                }
            })
    
    print(f"Loaded {len(documents)} knowledge items from {file_path}")
    return documents


def load_csv_tech_support(file_path: str) -> List[Dict[str, Any]]:
    """
    Load tech support tickets from tech_support_dataset.csv.
    
    Expected columns: Conversation ID, Customer Issue, Tech Response, 
                     Resolution Time, Issue Category, Issue Status
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        List of document dicts
    """
    documents = []
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        
        for i, row in enumerate(reader):
            issue = row.get('Customer Issue', '').strip()
            response = row.get('Tech Response', '').strip()
            category = row.get('Issue Category', '').strip()
            
            if not issue or not response:
                continue
            
            # Create a Q&A format
            content = f"Customer Issue: {issue}\n\nTech Support Response: {response}"
            
            doc_id = generate_doc_id(content, "tech_support", i)
            
            documents.append({
                "id": doc_id,
                "content": content,
                "metadata": {
                    "source": "tech_support_dataset.csv",
                    "category": category or "Tech Support",
                    "conversation_id": row.get('Conversation ID', ''),
                    "resolution_time": row.get('Resolution Time', ''),
                    "status": row.get('Issue Status', ''),
                    "row_index": i
                }
            })
    
    print(f"Loaded {len(documents)} tech support tickets from {file_path}")
    return documents


def load_csv_error_codes(file_path: str) -> List[Dict[str, Any]]:
    """
    Load error codes from large_error_codes.csv.
    
    Expected columns: error_code, description, category
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        List of document dicts (grouped by category for chunking efficiency)
    """
    documents = []
    
    # Group error codes by category for better chunking
    categories = {}
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            code = row.get('error_code', '').strip()
            description = row.get('description', '').strip()
            category = row.get('category', 'General').strip()
            
            if not code or not description:
                continue
            
            if category not in categories:
                categories[category] = []
            
            categories[category].append(f"Error {code}: {description}")
    
    # Create documents per category (group ~10 codes per chunk)
    for category, codes in categories.items():
        for i in range(0, len(codes), 10):
            chunk_codes = codes[i:i + 10]
            content = f"Windows Error Codes - {category}:\n\n" + "\n".join(chunk_codes)
            
            doc_id = generate_doc_id(content, "error_codes", i)
            
            documents.append({
                "id": doc_id,
                "content": content,
                "metadata": {
                    "source": "large_error_codes.csv",
                    "category": f"Error Codes - {category}",
                    "error_type": "Windows"
                }
            })
    
    print(f"Loaded {len(documents)} error code documents from {file_path}")
    return documents


def load_txt_file(file_path: str, source_name: str = None) -> List[Dict[str, Any]]:
    """
    Load and chunk a text file.
    
    Args:
        file_path: Path to TXT file
        source_name: Optional custom source name
        
    Returns:
        List of document dicts
    """
    documents = []
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    if not content.strip():
        return documents
    
    file_name = source_name or os.path.basename(file_path)
    
    # Determine category based on filename
    category = "Error Codes"
    if "http" in file_name.lower():
        category = "HTTP Error Codes"
    elif "linux" in file_name.lower():
        category = "Linux Error Codes"
    elif "windows" in file_name.lower():
        category = "Windows Error Codes"
    
    # Split into chunks
    chunks = split_text(
        content,
        metadata={
            "source": file_name,
            "category": category,
            "file_type": "txt"
        }
    )
    
    for i, chunk in enumerate(chunks):
        doc_id = generate_doc_id(chunk["content"], file_name, i)
        documents.append({
            "id": doc_id,
            "content": chunk["content"],
            "metadata": chunk["metadata"]
        })
    
    print(f"Loaded {len(documents)} chunks from {file_path}")
    return documents


def load_pdf_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Load and chunk a PDF file using PyMuPDF.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        List of document dicts
    """
    documents = []
    
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(file_path)
        file_name = os.path.basename(file_path)
        
        all_text = ""
        for page_num, page in enumerate(doc):
            text = page.get_text()
            if text.strip():
                all_text += f"\n\n[Page {page_num + 1}]\n{text}"
        
        doc.close()
        
        if not all_text.strip():
            return documents
        
        # Split into chunks with larger size for PDFs
        chunks = split_text(
            all_text,
            metadata={
                "source": file_name,
                "category": "Hardware Troubleshooting",
                "file_type": "pdf"
            },
            chunk_size=1000,
            chunk_overlap=200
        )
        
        for i, chunk in enumerate(chunks):
            doc_id = generate_doc_id(chunk["content"], file_name, i)
            documents.append({
                "id": doc_id,
                "content": chunk["content"],
                "metadata": chunk["metadata"]
            })
        
        print(f"Loaded {len(documents)} chunks from {file_path}")
        
    except ImportError:
        print("PyMuPDF not installed. Skipping PDF file.")
    except Exception as e:
        print(f"Error loading PDF {file_path}: {e}")
    
    return documents


def load_all_datasets(dataset_path: str = None) -> List[Dict[str, Any]]:
    """
    Load all datasets from the Dataset folder.
    
    Args:
        dataset_path: Path to Dataset folder
        
    Returns:
        Combined list of all documents
    """
    path = dataset_path or settings.dataset_path
    all_documents = []
    
    # Knowledge items CSV
    knowledge_file = os.path.join(path, "synthetic_knowledge_items.csv")
    if os.path.exists(knowledge_file):
        all_documents.extend(load_csv_knowledge_items(knowledge_file))
    
    # Tech support CSV
    tech_file = os.path.join(path, "tech_support_dataset.csv")
    if os.path.exists(tech_file):
        all_documents.extend(load_csv_tech_support(tech_file))
    
    # Error codes CSV
    error_file = os.path.join(path, "large_error_codes.csv")
    if os.path.exists(error_file):
        all_documents.extend(load_csv_error_codes(error_file))
    
    # TXT files
    txt_files = [
        "HTTP_Error_Code.txt",
        "Linux_Error_Code.txt", 
        "Windows_Error_Code.txt"
    ]
    for txt_file in txt_files:
        txt_path = os.path.join(path, txt_file)
        if os.path.exists(txt_path):
            all_documents.extend(load_txt_file(txt_path))
    
    # PDF files
    for file in os.listdir(path):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(path, file)
            all_documents.extend(load_pdf_file(pdf_path))
    
    print(f"\n=== Total documents loaded: {len(all_documents)} ===\n")
    return all_documents
