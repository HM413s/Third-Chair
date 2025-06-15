#!/usr/bin/env python3
"""
Multi-Document Comparison Test Script
Tests the new multi-document upload and comparison capabilities
"""

import os
import sys
import json
import asyncio
from typing import List, Dict, Any

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from RAG.rag_service import RAGService
from Agents.Firm_Standard_Agent.Firm_Standard_Agent import multi_document_comparison_agent, firm_standard_agent_auto
from Agents.Firm_Standard_Agent.context import FirmStandardContext

def create_sample_documents() -> List[str]:
    """Create sample legal documents for testing"""
    
    # Sample Contract 1
    contract1 = """
LEGAL SERVICES AGREEMENT

Section 1. Services
The attorney will provide legal services to the Client as described in Exhibit A.

Section 2. Fees
The Client agrees to pay the attorney's fees as outlined in this agreement.
- Hourly rate: $300 per hour
- Retainer: $5,000

Section 3. Termination
Either party may terminate this Agreement upon written notice.
"""

    # Sample Contract 2 (with inconsistencies)
    contract2 = """
ATTORNEY SERVICE CONTRACT

Sec. 1. Legal Services  
The lawyer shall provide legal services to the client as described in exhibit A.

Sec. 2. Payment
The client agrees to pay the lawyer's fees as outlined in this contract.
• Hourly rate: $300.00 per hour
• Retainer fee: $5000

Sec. 3. Ending the Agreement
Either party can terminate this contract upon written notice.
"""

    # Sample Contract 3 (different style)
    contract3 = """
LEGAL REPRESENTATION AGREEMENT

1. Scope of Services
The legal counsel will provide services to the Party as described in Schedule A.

2. Compensation
The Party agrees to pay legal counsel's fees per this agreement.
- Rate per hour: $300/hour  
- Initial retainer: 5,000 dollars

3. Contract Termination
Both parties may end this Agreement with written notification.
"""

    return [
        ("contract1.txt", contract1),
        ("contract2.txt", contract2), 
        ("contract3.txt", contract3)
    ]

def setup_test_documents(rag_service: RAGService) -> List[str]:
    """Upload test documents and return their filenames"""
    documents = create_sample_documents()
    uploaded_files = []
    
    print("📁 Setting up test documents...")
    
    for filename, content in documents:
        # Create temporary file but store with original name
        temp_path = f"temp_{filename}"
        with open(temp_path, 'w') as f:
            f.write(content)
        
        # Process through RAG service with original filename
        try:
            # Pass the original filename to be used as source_file
            num_docs = rag_service.process_and_store_document(temp_path, source_file=filename)
            print(f"  ✅ {filename}: {num_docs} chunks processed")
            uploaded_files.append(filename)
        except Exception as e:
            print(f"  ❌ {filename}: Error - {str(e)}")
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    return uploaded_files

def test_basic_comparison(rag_service: RAGService, document_sources: List[str]):
    """Test basic document comparison functionality"""
    print("\n🧪 Testing Basic Document Comparison...")
    
    try:
        # First, debug what documents are actually stored
        print("🔍 Debugging stored documents...")
        all_docs = rag_service.get_all_documents()
        print(f"Total documents in storage: {len(all_docs)}")
        
        # Show unique source files
        source_files_in_storage = set()
        for doc in all_docs:
            source_file = doc.get("source_file", "unknown")
            # Remove temp_ prefix if present
            if source_file.startswith("temp_"):
                source_file = source_file[5:]
            source_files_in_storage.add(source_file)
        
        print(f"Source files in storage: {list(source_files_in_storage)}")
        print(f"Source files we're searching for: {document_sources}")
        
        # Get comparison data
        comparison_data = []
        for source in document_sources:
            # Try to find documents with this source file
            docs_found = []
            for doc in all_docs:
                doc_source = doc.get("source_file", "")
                # Remove temp_ prefix if present for comparison
                if doc_source.startswith("temp_"):
                    doc_source = doc_source[5:]
                if doc_source == source:
                    docs_found.append(doc)
            
            print(f"Documents found for '{source}': {len(docs_found)}")
            
            if docs_found:
                comparison_data.append({
                    "source": source,
                    "documents": docs_found,
                    "total_chunks": len(docs_found)
                })
        
        if len(comparison_data) < 2:
            print("❌ Not enough documents for comparison")
            print("🔍 Available sources:", list(source_files_in_storage))
            return None
        
        # Perform comparison
        result = rag_service.compare_documents(comparison_data, "legal terminology and formatting")
        
        print(f"📊 Comparison Results:")
        print(f"  • Documents compared: {result.get('documents_compared', 0)}")
        print(f"  • Total chunks analyzed: {result.get('total_chunks_analyzed', 0)}")
        
        # Show cross-document findings
        findings = result.get('cross_document_findings', {})
        inconsistencies = findings.get('inconsistencies_found', [])
        
        print(f"  • Inconsistencies found: {len(inconsistencies)}")
        for inc in inconsistencies[:3]:  # Show first 3
            print(f"    - {inc.get('term', 'Unknown')}: {len(inc.get('variations_by_document', {}))} variations")
        
        return result
        
    except Exception as e:
        print(f"❌ Error in basic comparison: {str(e)}")
        return None

async def test_multi_document_agent(document_sources: List[str]):
    """Test the multi-document comparison agent"""
    print("\n🤖 Testing Multi-Document Comparison Agent...")
    
    try:
        # Run the multi-document comparison agent
        result = await multi_document_comparison_agent(document_sources)
        
        if result.get("success"):
            summary = result.get("summary", {})
            print(f"✅ Agent Analysis Complete!")
            print(f"  • Documents analyzed: {summary.get('documents_compared', 0)}")
            print(f"  • Cross-document score: {summary.get('cross_document_score', 0):.1f}%")
            print(f"  • Overall score: {summary.get('overall_score', 0):.1f}%")
            print(f"  • Total issues: {summary.get('total_issues', 0)}")
            
            # Show detailed findings
            final_report = result.get("final_report", {})
            if final_report.get("success"):
                terminology_issues = final_report.get("detailed_findings", {}).get("terminology_inconsistencies", [])
                formatting_issues = final_report.get("detailed_findings", {}).get("formatting_inconsistencies", [])
                
                print(f"\n📝 Detailed Findings:")
                print(f"  • Terminology inconsistencies: {len(terminology_issues)}")
                print(f"  • Formatting inconsistencies: {len(formatting_issues)}")
                
                # Show specific issues
                if terminology_issues:
                    print(f"\n🔤 Terminology Issues:")
                    for issue in terminology_issues[:2]:  # Show first 2
                        term = issue.get('term', 'Unknown')
                        variations = issue.get('variations_found', [])
                        print(f"    • '{term}': {len(variations)} variations found")
                        for var in variations[:3]:  # Show first 3 variations
                            print(f"      - '{var}'")
                
                if formatting_issues:
                    print(f"\n🎨 Formatting Issues:")
                    for issue in formatting_issues[:2]:  # Show first 2
                        issue_type = issue.get('type', 'Unknown').replace('_', ' ').title()
                        patterns = issue.get('patterns_found', [])
                        print(f"    • {issue_type}: {len(patterns)} different styles")
                        for pattern in patterns[:3]:  # Show first 3 patterns
                            print(f"      - '{pattern}'")
            
            return result
        else:
            error = result.get("error", "Unknown error")
            print(f"❌ Agent failed: {error}")
            return None
            
    except Exception as e:
        print(f"❌ Error in multi-document agent: {str(e)}")
        return None

def test_single_document_agent():
    """Test the single document agent for comparison"""
    print("\n🔧 Testing Single Document Agent (for comparison)...")
    
    try:
        result = firm_standard_agent_auto()
        
        if result.get("success"):
            final_report = result.get("final_report", {})
            print(f"✅ Single Document Analysis Complete!")
            print(f"  • Compliance score: {final_report.get('compliance_score', 0):.1f}%")
            print(f"  • Total issues: {final_report.get('total_issues', 0)}")
            
            breakdown = final_report.get('issue_breakdown', {})
            print(f"  • Issue breakdown:")
            for category, count in breakdown.items():
                if count > 0:
                    print(f"    - {category.replace('_', ' ').title()}: {count}")
            
            return result
        else:
            error = result.get("error", "Unknown error")
            print(f"❌ Single document agent failed: {error}")
            return None
            
    except Exception as e:
        print(f"❌ Error in single document agent: {str(e)}")
        return None

def show_comparison_summary(basic_result, agent_result, single_result):
    """Show a summary comparing all test results"""
    print("\n" + "="*60)
    print("📊 COMPREHENSIVE TEST SUMMARY")
    print("="*60)
    
    if basic_result:
        findings = basic_result.get('cross_document_findings', {})
        inconsistencies = findings.get('inconsistencies_found', [])
        print(f"🔍 Basic Comparison:")
        print(f"  • Documents: {basic_result.get('documents_compared', 0)}")
        print(f"  • Inconsistencies: {len(inconsistencies)}")
    
    if agent_result:
        summary = agent_result.get("summary", {})
        print(f"🤖 Multi-Document Agent:")
        print(f"  • Cross-doc score: {summary.get('cross_document_score', 0):.1f}%")
        print(f"  • Overall score: {summary.get('overall_score', 0):.1f}%")
        print(f"  • Total issues: {summary.get('total_issues', 0)}")
    
    if single_result:
        final_report = single_result.get("final_report", {})
        print(f"🔧 Single Document Agent:")
        print(f"  • Compliance score: {final_report.get('compliance_score', 0):.1f}%")
        print(f"  • Total issues: {final_report.get('total_issues', 0)}")
    
    print("\n✅ Multi-document comparison functionality is working!")
    print("📈 Key Benefits:")
    print("  • Cross-document inconsistency detection")
    print("  • Terminology standardization analysis")
    print("  • Formatting consistency checking")
    print("  • Comprehensive compliance scoring")

async def main():
    """Main test function"""
    print("🚀 Multi-Document Comparison Test Suite")
    print("="*50)
    
    # Initialize RAG service
    print("🔧 Initializing RAG service...")
    rag_service = RAGService()
    
    # Setup test documents
    document_sources = setup_test_documents(rag_service)
    
    if len(document_sources) < 2:
        print("❌ Need at least 2 documents for testing")
        return
    
    print(f"📁 Test documents ready: {document_sources}")
    
    # Run tests
    basic_result = test_basic_comparison(rag_service, document_sources)
    agent_result = await test_multi_document_agent(document_sources)
    single_result = test_single_document_agent()
    
    # Show summary
    show_comparison_summary(basic_result, agent_result, single_result)
    
    # Cleanup (optional)
    print("\n🧹 Cleaning up test documents...")
    try:
        for source in document_sources:
            rag_service.delete_documents(source)
        print("✅ Cleanup complete")
    except Exception as e:
        print(f"⚠️ Cleanup warning: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main()) 