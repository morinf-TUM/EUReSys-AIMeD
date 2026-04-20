import re
from typing import List, Dict, Any
from django.utils import timezone
from ..core.models import AuditLog
from .system_prompts import SAFETY_CONSTRAINTS

class ResponseValidator:
    """
    Validates and sanitizes LLM responses to ensure regulatory compliance
    """
    
    @classmethod
    def validate_response(cls, response: str, interaction_type: str, 
                        context: List[Dict]) -> str:
        """
        Validate and sanitize LLM response against safety constraints
        """
        original_response = response
        
        # 1. Check for prohibited content
        response = cls._filter_prohibited_content(response)
        
        # 2. Ensure proper disclaimers
        response = cls._ensure_disclaimers(response)
        
        # 3. Add context citations if missing
        response = cls._add_context_citations(response, context, interaction_type)
        
        # 4. Log any modifications
        if response != original_response:
            cls._log_response_modification(original_response, response)
        
        return response
    
    @classmethod
    def _filter_prohibited_content(cls, response: str) -> str:
        """Filter out prohibited phrases and replace with safe alternatives"""
        for phrase in SAFETY_CONSTRAINTS['prohibited_phrases']:
            if phrase.lower() in response.lower():
                # Replace with conservative language
                replacement = f"[CONSERVATIVE_INTERPRETATION_REQUIRED: {phrase}]"
                response = response.replace(phrase, replacement)
        
        return response
    
    @classmethod
    def _ensure_disclaimers(cls, response: str) -> str:
        """Ensure proper disclaimers are present"""
        # Add draft disclaimer if missing
        if '[DRAFT - HUMAN REVIEW REQUIRED]' not in response:
            response = f"[DRAFT - HUMAN REVIEW REQUIRED]\n\n{response}"
        
        # Add end marker if missing
        if '[END DRAFT]' not in response:
            response = f"{response}\n\n[END DRAFT]"
        
        # Add conservative interpretation notice if prohibited content was filtered
        if 'CONSERVATIVE_INTERPRETATION_REQUIRED' in response:
            response += (
                "\n\n[CONSERVATIVE_INTERPRETATION_NOTICE]\n"
                "This response contains placeholders where the system identified potentially "
                "problematic language. These require careful human review and conservative "
                "interpretation in accordance with applicable regulations."
            )
        
        return response
    
    @classmethod
    def _add_context_citations(cls, response: str, context: List[Dict], 
                              interaction_type: str) -> str:
        """Add relevant citations from RAG context if missing"""
        # Extract existing citations
        existing_citations = cls._extract_citations(response)
        
        # If few citations and we have context, add relevant ones
        if len(existing_citations) < 2 and context:
            response += f"\n\nRelevant regulatory sources:\n"
            for item in context[:3]:  # Top 3 most relevant
                response += f"- {item['source']}\n"
        
        return response
    
    @classmethod
    def _extract_citations(cls, text: str) -> List[str]:
        """Extract citation patterns from text"""
        citation_pattern = r'\((MDR|AI Act|GDPR) [A-Za-z0-9.]+ [0-9]+(?:\.[0-9]+)*\)'
        return re.findall(citation_pattern, text)
    
    @classmethod
    def _log_response_modification(cls, original: str, modified: str):
        """Log LLM response modifications for audit purposes"""
        # Create audit log for the modification
        AuditLog.objects.create(
            action='LLM_RESPONSE_MODIFIED',
            model_type='LLMInteraction',
            created_by=None,  # System action
            updated_by=None,
            action_details={
                'modification_type': 'safety_filtering',
                'original_length': len(original),
                'modified_length': len(modified),
                'changes': 'Prohibited content filtered and disclaimers added'
            },
            is_system_action=True
        )
    
    @classmethod
    def validate_llm_usage(cls, user, interaction_type: str, tokens_used: int) -> bool:
        """Validate LLM usage against compliance limits"""
        # Check daily usage limits
        from ..core.models import LLMInteraction
        from django.utils import timezone
        
        daily_usage = LLMInteraction.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timezone.timedelta(days=1)
        ).aggregate(models.Sum('tokens_used'))['tokens_used__sum'] or 0
        
        # Mock limit - would be configured in settings
        MAX_DAILY_TOKENS = 10000
        
        if daily_usage + tokens_used > MAX_DAILY_TOKENS:
            # Log compliance alert
            AuditLog.objects.create(
                action='LLM_USAGE_LIMIT_EXCEEDED',
                model_type='ComplianceAlert',
                created_by=None,
                updated_by=None,
                action_details={
                    'user_id': user.id,
                    'interaction_type': interaction_type,
                    'daily_usage': daily_usage,
                    'requested_tokens': tokens_used,
                    'limit': MAX_DAILY_TOKENS
                },
                is_system_action=True
            )
            return False
        
        return True