"""
Standalone Data Ingestion Script

Run this script to ingest all datasets into ChromaDB.

Usage:
    cd backend
    python scripts/ingest_data.py
    
Options:
    --force     Force re-ingestion (clear existing data first)
    --dry-run   Show what would be ingested without actually doing it
"""
import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.data_loader import load_all_datasets
from app.services.vectordb import get_vectordb_service
from app.config import get_settings


def main():
    parser = argparse.ArgumentParser(description="Ingest data into Scio knowledge base")
    parser.add_argument("--force", action="store_true", help="Force re-ingestion (clear existing data)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be ingested")
    args = parser.parse_args()
    
    settings = get_settings()
    
    print("=" * 60)
    print("  Scio Data Ingestion Script")
    print("=" * 60)
    print(f"\nDataset path: {os.path.abspath(settings.dataset_path)}")
    print(f"ChromaDB collection: {settings.chromadb_collection}")
    print(f"Force reingest: {args.force}")
    print(f"Dry run: {args.dry_run}")
    print()
    
    # Load documents
    print("Loading datasets...")
    documents = load_all_datasets()
    
    if not documents:
        print("ERROR: No documents loaded!")
        return 1
    
    print(f"\nTotal documents to ingest: {len(documents)}")
    
    # Show sample
    print("\nSample documents:")
    for i, doc in enumerate(documents[:3]):
        print(f"\n  [{i+1}] Source: {doc['metadata'].get('source', 'Unknown')}")
        print(f"      Category: {doc['metadata'].get('category', 'Unknown')}")
        print(f"      Content preview: {doc['content'][:100]}...")
    
    if args.dry_run:
        print("\n[DRY RUN] No data was ingested.")
        return 0
    
    # Get vector DB service
    print("\n" + "-" * 60)
    vectordb = get_vectordb_service()
    
    # Check current stats
    stats = vectordb.get_stats()
    print(f"Current documents in DB: {stats['total_documents']}")
    
    # Clear if force
    if args.force:
        print("\nClearing existing data...")
        vectordb.delete_all()
    
    # Ingest documents
    print("\nIngesting documents...")
    doc_contents = [doc["content"] for doc in documents]
    doc_metadatas = [doc["metadata"] for doc in documents]
    doc_ids = [doc["id"] for doc in documents]
    
    count = vectordb.add_documents(
        documents=doc_contents,
        metadatas=doc_metadatas,
        ids=doc_ids
    )
    
    # Final stats
    stats = vectordb.get_stats()
    print("\n" + "=" * 60)
    print(f"  Ingestion Complete!")
    print(f"  Documents processed: {count}")
    print(f"  Total in database: {stats['total_documents']}")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
