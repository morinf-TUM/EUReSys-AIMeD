import json
from typing import List, Dict, Any
from ...core.models import RegulatorySource

class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline for regulatory documents
    """
    
    def __init__(self):
        # In a real implementation, this would connect to a vector database
        # For now, we'll use a simple in-memory approach
        self.regulatory_sources = {}
        self._load_regulatory_sources()
    
    def _load_regulatory_sources(self):
        """Load regulatory sources from database"""
        try:
            sources = RegulatorySource.objects.filter(is_active=True)
            for source in sources:
                self.regulatory_sources[source.reference_code] = {
                    'title': source.title,
                    'content': source.content,
                    'regulation': source.regulation,
                    'source_type': source.source_type,
                    'reference': source.reference_code
                }
        except Exception as e:
            # If database is not available, use fallback sources
            print(f"Could not load regulatory sources from database: {e}")
            self._load_fallback_sources()
    
    def _load_fallback_sources(self):
        """Load fallback regulatory sources"""
        # This would be replaced with actual regulatory content in production
        self.regulatory_sources = {
            'MDR Annex VIII': {
                'title': 'MDR Annex VIII - Classification Rules',
                'content': 'Classification rules for medical devices...',
                'regulation': 'MDR',
                'source_type': 'annex',
                'reference': 'MDR Annex VIII'
            },
            'AI Act Annex II': {
                'title': 'AI Act Annex II - High-Risk AI Systems',
                'content': 'List of high-risk AI systems...',
                'regulation': 'AI_Act',
                'source_type': 'annex',
                'reference': 'AI Act Annex II'
            },
            'GDPR Article 9': {
                'title': 'GDPR Article 9 - Special Categories of Personal Data',
                'content': 'Processing of special categories of personal data...',
                'regulation': 'GDPR',
                'source_type': 'regulation',
                'reference': 'GDPR Article 9'
            }
        }
    
    def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        """
        Retrieve relevant regulatory context for a query
        """
        # Simple keyword-based retrieval for now
        # In production, this would use vector similarity search
        
        query_lower = query.lower()
        relevant_sources = []
        
        for ref_code, source in self.regulatory_sources.items():
            # Check if query keywords match source content or metadata
            content_lower = source['content'].lower()
            title_lower = source['title'].lower()
            
            # Simple keyword matching
            keywords = ['mdr', 'annex viii', 'classification', 'rule 11',
                       'ai act', 'high risk', 'annex ii',
                       'gdpr', 'article 9', 'special categories',
                       'diagnosis', 'treatment', 'monitoring']
            
            # Check if any keywords are in the query and match the source
            for keyword in keywords:
                if keyword in query_lower and keyword in content_lower:
                    relevant_sources.append({
                        'source': source['reference'],
                        'title': source['title'],
                        'content': source['content'][:500] + '...',  # Truncate
                        'regulation': source['regulation'],
                        'relevance_score': 0.9  # Mock score
                    })
                    break
        
        # Add some general regulatory sources if no specific matches
        if not relevant_sources:
            for ref_code, source in list(self.regulatory_sources.items())[:3]:
                relevant_sources.append({
                    'source': source['reference'],
                    'title': source['title'],
                    'content': source['content'][:500] + '...',
                    'regulation': source['regulation'],
                    'relevance_score': 0.7
                })
        
        return relevant_sources
    
    def generate_with_context(self, prompt: str, context: List[Dict]) -> str:
        """
        Generate augmented prompt with RAG context
        """
        # Format the context for inclusion in the prompt
        context_text = "\n\nRELEVANT REGULATORY SOURCES:\n"
        
        for i, source in enumerate(context, 1):
            context_text += f"\nSource {i}: {source['source']}\n"
            context_text += f"Title: {source['title']}\n"
            context_text += f"Content: {source['content']}\n"
        
        # Combine original prompt with context
        augmented_prompt = f"{prompt}{context_text}\n\nINSTRUCTIONS:\n"
        augmented_prompt += "Use the provided regulatory sources to inform your response.\n"
        augmented_prompt += "Always cite specific articles and annexes.\n"
        augmented_prompt += "If information is not available in the sources, indicate uncertainty.\n"
        
        return augmented_prompt
    
    def get_source_by_reference(self, reference: str) -> Dict[str, Any]:
        """
        Get a specific regulatory source by reference
        """
        return self.regulatory_sources.get(reference, {})
    
    def search_sources(self, search_term: str) -> List[Dict[str, Any]]:
        """
        Search regulatory sources by term
        """
        search_term_lower = search_term.lower()
        results = []
        
        for ref_code, source in self.regulatory_sources.items():
            if (search_term_lower in source['title'].lower() or
                search_term_lower in source['content'].lower() or
                search_term_lower in ref_code.lower()):
                results.append({
                    'reference': ref_code,
                    'title': source['title'],
                    'regulation': source['regulation'],
                    'source_type': source['source_type']
                })
        
        return results