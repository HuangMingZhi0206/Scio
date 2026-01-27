"""
RAG Evaluation Script for Scio IT Helpdesk
Mengukur akurasi retrieval dan jawaban chatbot
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Tuple
import json
from datetime import datetime

from app.services.vectordb import get_vectordb_service
from app.services.rag import get_rag_service
from app.services.embeddings import get_embedding_service


# Test cases dengan pertanyaan dan expected keywords dalam jawaban
TEST_CASES = [
    {
        "id": 1,
        "question": "How do I connect to WiFi?",
        "category": "networking",
        "expected_keywords": ["wifi", "network", "connect", "settings", "wireless"],
        "should_answer": True,  # IT-related, should answer
    },
    {
        "id": 2,
        "question": "My printer is showing offline. How to fix it?",
        "category": "hardware",
        "expected_keywords": ["printer", "offline", "driver", "restart", "connection"],
        "should_answer": True,
    },
    {
        "id": 3,
        "question": "What is error code 0x0000007E?",
        "category": "error_codes",
        "expected_keywords": ["error", "driver", "system", "blue screen", "bsod"],
        "should_answer": True,
    },
    {
        "id": 4,
        "question": "How to reset my password?",
        "category": "account",
        "expected_keywords": ["password", "reset", "account", "login", "credentials"],
        "should_answer": True,
    },
    {
        "id": 5,
        "question": "How to setup VPN on Windows?",
        "category": "software",
        "expected_keywords": ["vpn", "settings", "connection", "network", "server"],
        "should_answer": True,
    },
    {
        "id": 6,
        "question": "My laptop is very slow. What should I do?",
        "category": "troubleshooting",
        "expected_keywords": ["slow", "performance", "memory", "disk", "startup", "cleanup"],
        "should_answer": True,
    },
    {
        "id": 7,
        "question": "How to configure email in Outlook?",
        "category": "software",
        "expected_keywords": ["email", "outlook", "account", "settings", "imap", "smtp"],
        "should_answer": True,
    },
    {
        "id": 8,
        "question": "What is HTTP error 404?",
        "category": "error_codes",
        "expected_keywords": ["404", "not found", "page", "url", "server"],
        "should_answer": True,
    },
    # Non-IT questions (should be rejected)
    {
        "id": 9,
        "question": "Siapa presiden Indonesia?",
        "category": "non_it",
        "expected_keywords": ["maaf", "hanya", "teknis", "it", "tidak dapat"],
        "should_answer": False,
    },
    {
        "id": 10,
        "question": "Berapa skor pertandingan bola kemarin?",
        "category": "non_it",
        "expected_keywords": ["maaf", "hanya", "teknis", "it", "tidak dapat"],
        "should_answer": False,
    },
]


def evaluate_retrieval(question: str, top_k: int = 5) -> Dict:
    """Evaluate retrieval quality for a question."""
    vectordb = get_vectordb_service()
    results = vectordb.search(question, top_k=top_k)
    
    # Use relevance_score (1 - distance), not score
    scores = [r.get("relevance_score", 0) for r in results]
    
    return {
        "num_results": len(results),
        "avg_score": sum(scores) / len(scores) if scores else 0,
        "top_score": scores[0] if scores else 0,
        "sources": [r.get("metadata", {}).get("source", "unknown") for r in results],
    }


def evaluate_answer(question: str, answer: str, expected_keywords: List[str], should_answer: bool) -> Dict:
    """Evaluate answer quality based on expected keywords."""
    answer_lower = answer.lower()
    
    # Check if keywords are present
    keywords_found = []
    keywords_missing = []
    
    for keyword in expected_keywords:
        if keyword.lower() in answer_lower:
            keywords_found.append(keyword)
        else:
            keywords_missing.append(keyword)
    
    keyword_score = len(keywords_found) / len(expected_keywords) if expected_keywords else 0
    
    # Check if non-IT questions are properly rejected
    if not should_answer:
        # Should contain rejection phrases
        rejection_phrases = ["maaf", "tidak dapat", "hanya", "teknis", "it-related"]
        is_rejected = any(phrase in answer_lower for phrase in rejection_phrases)
        topic_filter_correct = is_rejected
    else:
        # Should NOT contain rejection for IT questions
        rejection_phrases = ["maaf, saya hanya dapat", "tidak dapat membantu"]
        is_rejected = any(phrase in answer_lower for phrase in rejection_phrases)
        topic_filter_correct = not is_rejected
    
    return {
        "keyword_score": round(keyword_score * 100, 2),
        "keywords_found": keywords_found,
        "keywords_missing": keywords_missing,
        "topic_filter_correct": topic_filter_correct,
        "answer_length": len(answer),
    }


def run_evaluation(verbose: bool = True) -> Dict:
    """Run full evaluation on all test cases."""
    print("=" * 60)
    print("  SCIO RAG EVALUATION")
    print("=" * 60)
    print()
    
    rag_service = get_rag_service()
    results = []
    
    total_keyword_score = 0
    total_retrieval_score = 0
    total_topic_filter_correct = 0
    
    for i, test_case in enumerate(TEST_CASES):
        print(f"[{i+1}/{len(TEST_CASES)}] Testing: {test_case['question'][:50]}...")
        
        try:
            # Get RAG response
            response, sources, is_critical = rag_service.generate_response(
                test_case["question"],
                conversation_history=None
            )
            
            # Evaluate retrieval
            retrieval_eval = evaluate_retrieval(test_case["question"])
            
            # Evaluate answer
            answer_eval = evaluate_answer(
                test_case["question"],
                response,
                test_case["expected_keywords"],
                test_case["should_answer"]
            )
            
            result = {
                "test_id": test_case["id"],
                "question": test_case["question"],
                "category": test_case["category"],
                "should_answer": test_case["should_answer"],
                "answer_preview": response[:200] + "..." if len(response) > 200 else response,
                "retrieval": retrieval_eval,
                "answer_quality": answer_eval,
                "sources_count": len(sources),
            }
            
            results.append(result)
            
            # Accumulate scores
            total_keyword_score += answer_eval["keyword_score"]
            total_retrieval_score += retrieval_eval["avg_score"] * 100
            if answer_eval["topic_filter_correct"]:
                total_topic_filter_correct += 1
            
            if verbose:
                status = "✅" if answer_eval["topic_filter_correct"] else "❌"
                print(f"     {status} Keyword: {answer_eval['keyword_score']}% | Retrieval: {retrieval_eval['avg_score']:.2f}")
                
        except Exception as e:
            print(f"     ❌ Error: {str(e)}")
            results.append({
                "test_id": test_case["id"],
                "question": test_case["question"],
                "error": str(e),
            })
    
    # Calculate overall metrics
    num_tests = len(TEST_CASES)
    
    metrics = {
        "total_tests": num_tests,
        "avg_keyword_accuracy": round(total_keyword_score / num_tests, 2),
        "avg_retrieval_score": round(total_retrieval_score / num_tests, 2),
        "topic_filter_accuracy": round((total_topic_filter_correct / num_tests) * 100, 2),
        "timestamp": datetime.now().isoformat(),
    }
    
    # Print summary
    print()
    print("=" * 60)
    print("  EVALUATION RESULTS")
    print("=" * 60)
    print()
    print(f"  📊 Total Test Cases:      {metrics['total_tests']}")
    print(f"  🎯 Keyword Accuracy:      {metrics['avg_keyword_accuracy']}%")
    print(f"  🔍 Retrieval Score:       {metrics['avg_retrieval_score']}%")
    print(f"  🚫 Topic Filter Accuracy: {metrics['topic_filter_accuracy']}%")
    print()
    print("=" * 60)
    
    # Save results to file
    output = {
        "metrics": metrics,
        "test_results": results,
    }
    
    output_path = os.path.join(os.path.dirname(__file__), "evaluation_results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"  Results saved to: {output_path}")
    print("=" * 60)
    
    return output


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Evaluate Scio RAG accuracy")
    parser.add_argument("--quiet", "-q", action="store_true", help="Less verbose output")
    args = parser.parse_args()
    
    run_evaluation(verbose=not args.quiet)
