import time
import re
import json
from typing import List, Dict, Any, Optional
from django.utils import timezone
from django.core.exceptions import ImproperlyConfigured

# Local Mistral integration
try:
    from mistralai.client import MistralClient
    from mistralai.models.chat_completion import ChatMessage
    MISTRAL_AVAILABLE = True
    print("NOTICE: Mistral AI client library successfully imported.")
except ImportError:
    print("FATAL ImportError: Mistral AI client library not available. LLMService will not run.")
    MISTRAL_AVAILABLE = False

# Optional imports for full functionality (not required for classification verification)
try:
    from ..core.models import LLMInteraction, DocumentSection, RegulatoryProfile
    from .system_prompts import SYSTEM_PROMPT_TEMPLATE, SAFETY_CONSTRAINTS
    try:
        from .rag.rag_pipeline import RAGPipeline
        from .response_validator import ResponseValidator
        FULL_FUNCTIONALITY = True
    except ImportError as e2:
        # RAG not available, but we can still do classification verification
        FULL_FUNCTIONALITY = False
        print(f"Running without RAG (classification verification still works): {e2}")
except ImportError as e:
    # For classification verification, we only need basic functionality
    FULL_FUNCTIONALITY = False
    print(f"Running in limited mode (no models): {e}")

class LLMService:
    """
    Main LLM service with constrained integration
    """
    
    def __init__(self):
        # Initialize RAG only if available
        if 'RAGPipeline' in globals():
            self.rag_pipeline = RAGPipeline()
        else:
            self.rag_pipeline = None
            
        if 'ResponseValidator' in globals():
            self.response_validator = ResponseValidator()
        else:
            self.response_validator = None
            
        self.mistral_client = self._initialize_mistral_client()
        self.mistral_available = MISTRAL_AVAILABLE  # Make it an instance variable
        
        # Verify that the service is properly initialized
        if self.mistral_client is None and self.mistral_available:
            print("WARNING: Mistral client failed to initialize despite MISTRAL_AVAILABLE=True")
    
    def _initialize_mistral_client(self):
        """Initialize Mistral client - Choose between local server and online API based on configuration"""
        print("DEBUG: _initialize_mistral_client called")
        if not MISTRAL_AVAILABLE:
            print("DEBUG: Mistral not available (MISTRAL_AVAILABLE=False)")
            return None
        
        print("DEBUG: MISTRAL_AVAILABLE=True, proceeding with initialization")
        
        try:
            # Import Django settings to check configuration
            from django.conf import settings
            import os
            
            # Check if local Mistral server should be used
            use_local = getattr(settings, 'USE_LOCAL_MISTRAL', False)
            local_url = getattr(settings, 'LOCAL_MISTRAL_URL', 'http://localhost:11434/v1')
            api_key = getattr(settings, 'MISTRAL_API_KEY', '') or os.environ.get('MISTRAL_API_KEY', '')
            
            print(f"DEBUG: Configuration - use_local={use_local}, api_key_available={bool(api_key)}")
            print("DEBUG: About to check use_local flag")
            print(f"DEBUG: use_local is actually: {use_local}")
            print(f"DEBUG: local_url is: {local_url}")
            
        except (ImportError, django.core.exceptions.ImproperlyConfigured) as e:
            # Fallback: Use environment variables if Django settings not available
            print(f"DEBUG: Django settings not available, using environment variables: {e}")
            print(f"DEBUG: Fallback config - use_local={use_local}, api_key_available={bool(api_key)}")
            print(f"DEBUG: Main path use_local={use_local}")
            raise e
            
        if use_local:
            print(f"DEBUG: Using LOCAL Mistral server at {local_url}")
            try:
                # Initialize client for local server
                client = MistralClient(
                    endpoint=local_url,
                    api_key='ollama'  # Default key for local Ollama/Mistral servers
                )
                print("✅ Local Mistral client initialized", client)
                print(f"DEBUG: Using local endpoint: {local_url}")
                return client
            except Exception as e:
                print(f"Failed to initialize local Mistral client: {e}")
                print("DEBUG: Falling back to Mistral AI API")
                # Fall through to online API
        
        # Use Mistral AI API (default or fallback)
        print("DEBUG: Starting Mistral AI API client creation")
        try:
            print("DEBUG: Inside Mistral AI API try block")
            if api_key:
                print(f"DEBUG: Using Mistral AI API with key (length: {len(api_key)})")
                client = MistralClient(api_key=api_key)
            else:
                print("DEBUG: Using Mistral AI API without key")
                client = MistralClient()
            
            print("✅ Mistral AI API client initialized", client)
            return client
        except Exception as e:
            print(f"DEBUG: Mistral AI API client creation failed: {e}")
            import traceback
            traceback.print_exc()
            raise  # Re-raise to fail explicitly
            
    
    def generate_explanation(self, user, document_section, query: str) -> Dict[str, Any]:
        """
        Generate regulatory explanation with RAG context
        """
        if not FULL_FUNCTIONALITY:
            raise RuntimeError("generate_explanation requires full functionality (RAG, models)")
        
        # Get regulatory context
        regulatory_profile = document_section.document_set.regulatory_profile
        
        # Retrieve relevant regulatory documents
        context = self.rag_pipeline.retrieve_context(
            f"{query} {regulatory_profile.mdr_class} {regulatory_profile.ai_act_high_risk}"
        )
        
        # Create prompt
        prompt = self._create_explanation_prompt(
            query, document_section, regulatory_profile
        )
        
        # Generate response with constraints
        response = self._generate_with_constraints(
            prompt, context, 'explanation', user, document_section
        )
        
        return response
    
    def generate_draft_text(self, user, document_section, requirements: str) -> Dict[str, Any]:
        """
        Generate draft text for documentation section
        """
        if not FULL_FUNCTIONALITY:
            raise RuntimeError("generate_draft_text requires full functionality (RAG, models)")
        
        # Get device information
        product_version = document_section.document_set.product_version
        device_desc = product_version.device_descriptions.first()
        
        # Retrieve relevant regulatory documents
        context = self.rag_pipeline.retrieve_context(
            f"{document_section.template_reference} {device_desc.device_type}"
        )
        
        # Create prompt
        prompt = self._create_draft_text_prompt(
            document_section, requirements, device_desc
        )
        
        # Generate response with constraints
        response = self._generate_with_constraints(
            prompt, context, 'draft_text', user, document_section
        )
        
        return response
    
    def _create_explanation_prompt(self, query: str, document_section, 
                                  regulatory_profile) -> str:
        """Create explanation prompt"""
        device_desc = document_section.document_set.product_version.device_descriptions.first()
        
        # Extract regulation and article from query
        parts = query.split()
        regulation = parts[0] if len(parts) > 0 else "regulation"
        article = " ".join(parts[1:]) if len(parts) > 1 else "article"
        
        return f"""
Provide a clear explanation of {regulation} {article} in the context of {device_desc.device_type}.

Device Information:
- Type: {device_desc.device_type}
- Description: {document_section.document_set.product_version.product.description}
- AI Functionality: {device_desc.ai_functionality_description or 'N/A'}

Current Regulatory Profile:
- MDR Class: {regulatory_profile.mdr_class or 'Not applicable'}
- AI Act High-Risk: {'Yes' if regulatory_profile.ai_act_high_risk else 'No'}
- GDPR DPIA Required: {'Yes' if regulatory_profile.requires_dpia else 'No'}

Focus on practical implications for documentation and compliance.
Use simple language suitable for SMEs.
Provide specific examples relevant to this device type.
"""
    
    def _create_draft_text_prompt(self, document_section, 
                                   requirements: str, device_desc) -> str:
        """Create draft text prompt"""
        return f"""
Generate draft text for section "{document_section.title}" based on the following:

Regulatory Requirements:
{requirements}

Device Information:
- Type: {device_desc.device_type}
- Description: {document_section.document_set.product_version.product.description}
- AI Functionality: {device_desc.ai_functionality_description or 'N/A'}

Existing Content:
{document_section.content or 'None'}

Follow this structure:
1. Brief introduction (1-2 sentences)
2. Specific information about the device
3. Regulatory compliance statement with citations
4. References to evidence or appendices

Use formal, professional language suitable for regulatory documentation.
Always include citations like (MDR Article 10(2)) or (AI Act Annex II.1).
"""
    
    def _generate_with_constraints(self, prompt: str, context: List[Dict], 
                                   interaction_type: str, user, document_section) -> Dict[str, Any]:
        """Generate response with all constraints and auditing"""
        # Create system prompt
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            regulatory_profile=json.dumps({
                'mdr_class': document_section.document_set.regulatory_profile.mdr_class,
                'ai_act_high_risk': document_section.document_set.regulatory_profile.ai_act_high_risk,
                'requires_dpia': document_section.document_set.regulatory_profile.requires_dpia
            }),
            section_info=json.dumps({
                'title': document_section.title,
                'template': document_section.template_reference
            }),
            user_request=prompt
        )
        
        # Generate augmented prompt with RAG context
        augmented_prompt = self.rag_pipeline.generate_with_context(prompt, context)
        
        # Generate response from LLM (try Mistral first, fallback to mock)
        start_time = time.time()
        response = self._generate_with_mistral(augmented_prompt, system_prompt)
        end_time = time.time()
        
        # Validate and filter response
        validated_response = self.response_validator.validate_response(
            response, interaction_type, context
        )
        
        # Create LLM interaction record
        llm_interaction = LLMInteraction.objects.create(
            user=user,
            document_section=document_section,
            interaction_type=interaction_type,
            prompt=augmented_prompt,
            response=validated_response,
            system_prompt_used=system_prompt,
            rag_context=context,
            tokens_used=len(response.split()),
            response_time_ms=int((end_time - start_time) * 1000),
            status='generated'
        )
        
        return {
            'response': validated_response,
            'interaction_id': str(llm_interaction.id),
            'citations': self._extract_citations(validated_response),
            'requires_approval': True
        }
    
    def _generate_with_mistral(self, prompt: str, system_prompt: str) -> str:
        """
        Generate response using local Mistral model
        NO MOCK FALLBACK - will crash if Mistral not available
        """
        if not self.mistral_client:
            raise RuntimeError("Mistral client not available - local inference server must be running")
        
        # Create chat completion request
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=prompt)
        ]
        
        # Call Mistral AI API models (use actual available models)
        try:
            # Try mistral-tiny first (smallest, fastest model)
            response = self.mistral_client.chat(
                model="mistral-tiny",  # Mistral AI API model
                messages=messages,
                temperature=0.3,  # Conservative for regulatory content
                max_tokens=1000
            )
        except Exception as e:
            # Fallback to mistral-small if mistral-tiny fails
            print(f"mistral-tiny failed, trying mistral-small: {e}")
            try:
                response = self.mistral_client.chat(
                    model="mistral-small",  # Alternative Mistral AI API model
                    messages=messages,
                    temperature=0.3,
                    max_tokens=1000
                )
            except Exception as e2:
                # Final fallback to mistral-medium
                print(f"mistral-small failed, trying mistral-medium: {e2}")
                response = self.mistral_client.chat(
                    model="mistral-medium",  # Larger Mistral AI API model
                    messages=messages,
                    temperature=0.3,
                    max_tokens=1000
                )
        
        # Extract and format the response
        print(f"DEBUG: Mistral response: {response}")  # Add debugging
        print(f"DEBUG: Response choices: {len(response.choices) if hasattr(response, 'choices') else 'No choices'}")
        
        if response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            print(f"DEBUG: Extracted content length: {len(content)}")  # Add debugging
            
            # Ensure proper formatting for regulatory content
            if not content.startswith('[DRAFT'):
                content = f"[DRAFT - HUMAN REVIEW REQUIRED]\n\n{content}\n\n[END DRAFT]"
            
            print(f"DEBUG: Final content length: {len(content)}")  # Add debugging
            return content
        else:
            print(f"DEBUG: No choices in response: {response}")  # Add debugging
            raise RuntimeError(f"Mistral returned no choices: {response}")
    
    def generate_classification_verification(self, classification_data: dict, device_info: dict, intended_purpose: str) -> str:
        """
        Generate LLM verification of classification results
        
        Args:
            classification_data: Dictionary containing MDR, AI Act, and GDPR classifications
            device_info: Device information from the decision engine
            intended_purpose: The intended purpose of the device
            
        Returns:
            LLM's verification comment with agreement/disagreement and reasoning
        """
        # Extract classification results
        mdr_class = classification_data.get('mdr_classification', 'Unknown')
        ai_act_class = classification_data.get('ai_act_classification', 'Unknown')
        gdpr_requirement = classification_data.get('gdpr_requirements', 'Unknown')
        
        # Create verification prompt
        verification_prompt = f"""
You are a regulatory compliance assistant reviewing AI medical device classifications.

## Device Information:
- Name: {device_info.get('deviceName', 'N/A')}
- Description: {device_info.get('deviceDescription', 'N/A')}
- Uses AI: {'Yes' if device_info.get('usesAI', False) else 'No'}
- Medical Purpose: {'Yes' if device_info.get('isMedicalPurpose', False) else 'No'}

## Intended Purpose:
{intended_purpose}

## Classification Results from Decision Engine:
- MDR Classification: {mdr_class}
- AI Act Classification: {ai_act_class}
- GDPR Requirement: {gdpr_requirement}

## Your Task:
1. Analyze whether these classifications appear appropriate based on the device information and intended purpose
2. Provide your assessment of agreement or disagreement with each classification
3. Explain your reasoning with specific references to MDR, AI Act, and GDPR regulations
4. Be conservative and err on the side of compliance
5. Format your response clearly with headings
6. Identify any missing information or unclear aspects in the provided data
7. State any assumptions you had to make due to incomplete information

## Important Constraints:
- NEVER make final compliance determinations
- ALWAYS mark your response as DRAFT requiring human review
- ALWAYS cite specific regulatory articles/annexes
- Be conservative and suggest higher risk classifications when uncertain
- Be transparent about information gaps and assumptions
"""
        
        # Use system prompt template for consistency (or basic template if not available)
        if FULL_FUNCTIONALITY and 'SYSTEM_PROMPT_TEMPLATE' in locals():
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
                regulatory_profile=json.dumps({
                    'mdr_class': mdr_class,
                    'ai_act_high_risk': ai_act_class == 'High-risk',
                    'requires_dpia': gdpr_requirement == 'DPIA required'
                }),
                section_info=json.dumps({
                    'title': 'Classification Verification',
                    'template': 'classification_verification'
                }),
                user_request=verification_prompt
            )
        else:
            # Basic system prompt for classification verification
            system_prompt = f"""
You are a regulatory compliance assistant reviewing AI medical device classifications.

## CONSTRAINTS (MUST FOLLOW):
1. NEVER make legal determinations or compliance assertions
2. NEVER classify devices or determine regulatory status
3. ALWAYS cite specific articles/annexes from MDR, AI Act, or GDPR
4. ALWAYS mark output as "DRAFT" and require human review
5. NEVER contradict the system's deterministic regulatory decisions
6. ALWAYS be conservative in interpretations
7. NEVER provide medical or legal advice

## CONTEXT:
- Current regulatory profile: {{"mdr_class": "{mdr_class}", "ai_act_high_risk": {str(ai_act_class == 'High-risk').lower()}, "requires_dpia": {str(gdpr_requirement == 'DPIA required').lower()}}}
- Document section: {{"title": "Classification Verification", "template": "classification_verification"}}
- User request: {verification_prompt}

## INSTRUCTIONS:
1. Use ONLY the provided regulatory sources
2. Be precise and cite specific provisions
3. Format responses clearly with citations
4. Indicate when information is uncertain
5. Suggest conservative approaches

## OUTPUT FORMAT:
[DRAFT - HUMAN REVIEW REQUIRED]
[Your response with inline citations like (MDR Annex VIII Rule 11)]
[END DRAFT]
"""
        
        # Generate verification using Mistral (NO MOCK - will crash if not available)
        return self._generate_with_mistral(verification_prompt, system_prompt)
    
    def generate_input_quality_assessment(self, base_data: dict) -> str:
        """
        Generate LLM assessment of user input quality and identify missing information
        
        Args:
            base_data: Dictionary containing all available user input data including:
                - deviceName, deviceDescription, intendedPurpose
                - classification results (mdr_classification, ai_act_classification, gdpr_requirements)
                - justification and regulatory references
                
        Returns:
            LLM's assessment with list of questions to ask user for clarification
        """
        # Extract all available data
        device_name = base_data.get('deviceName', 'N/A')
        device_description = base_data.get('deviceDescription', 'N/A')
        intended_purpose = base_data.get('intendedPurpose', 'N/A')
        
        # Extract classification results
        mdr_class = base_data.get('mdr_classification', 'Unknown')
        ai_act_class = base_data.get('ai_act_classification', 'Unknown')
        gdpr_requirement = base_data.get('gdpr_requirements', 'Unknown')
        
        # Extract justification and references
        justification = base_data.get('justification', [])
        regulatory_references = base_data.get('regulatory_references', {})
        
        # Create assessment prompt
        assessment_prompt = f"""
You are a regulatory compliance assistant reviewing user input for AI medical device classification.

## User Input Data:
- Device Name: {device_name}
- Device Description: {device_description}
- Intended Purpose: {intended_purpose}

## Classification Results:
- MDR Classification: {mdr_class}
- AI Act Classification: {ai_act_class}
- GDPR Requirement: {gdpr_requirement}

## Justification:
{chr(10).join([f"• {item}" for item in justification]) if justification else 'No justification provided'}

## Regulatory References:
- MDR: {', '.join(regulatory_references.get('mdr', [])) if regulatory_references.get('mdr') else 'None'}
- AI Act: {', '.join(regulatory_references.get('ai_act', [])) if regulatory_references.get('ai_act') else 'None'}
- GDPR: {', '.join(regulatory_references.get('gdpr', [])) if regulatory_references.get('gdpr') else 'None'}

## Your Task:
1. Analyze the completeness and clarity of the user input data
2. Identify any ambiguities, missing information, or unclear aspects
3. Generate a list of specific questions to ask the user for clarification
4. Explain why each question is important for accurate regulatory classification
5. Format your response as a structured list of questions with explanations
6. Be conservative and thorough - better to ask too many questions than too few
7. Focus on information that could change the regulatory classification

## Important Constraints:
- NEVER make legal determinations or compliance assertions
- NEVER classify devices or determine regulatory status
- ALWAYS cite specific articles/annexes from MDR, AI Act, or GDPR when relevant
- ALWAYS mark output as "DRAFT" and require human review
- ALWAYS be conservative in interpretations
- NEVER provide medical or legal advice

## Output Format:
[DRAFT - HUMAN REVIEW REQUIRED]

## Assessment of User Input Quality:
[Your assessment of completeness, clarity, and potential issues]

## List of Questions for User:
1. [Question 1]
   - Why this is important: [Explanation with regulatory context]
   - Potential impact: [How this could affect classification]
   
2. [Question 2]
   - Why this is important: [Explanation with regulatory context]
   - Potential impact: [How this could affect classification]
   
[Continue with additional questions as needed]

[END DRAFT]
"""
        
        # Use system prompt template for consistency (or basic template if not available)
        if FULL_FUNCTIONALITY and 'SYSTEM_PROMPT_TEMPLATE' in locals():
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
                regulatory_profile=json.dumps({
                    'mdr_class': mdr_class,
                    'ai_act_high_risk': ai_act_class == 'High-risk',
                    'requires_dpia': gdpr_requirement == 'DPIA required'
                }),
                section_info=json.dumps({
                    'title': 'Input Quality Assessment',
                    'template': 'input_quality_assessment'
                }),
                user_request=assessment_prompt
            )
        else:
            # Basic system prompt for input quality assessment
            system_prompt = f"""
You are a regulatory compliance assistant reviewing user input for AI medical device classification.

## CONSTRAINTS (MUST FOLLOW):
1. NEVER make legal determinations or compliance assertions
2. NEVER classify devices or determine regulatory status
3. ALWAYS cite specific articles/annexes from MDR, AI Act, or GDPR
4. ALWAYS mark output as "DRAFT" and require human review
5. NEVER contradict the system's deterministic regulatory decisions
6. ALWAYS be conservative in interpretations
7. NEVER provide medical or legal advice

## CONTEXT:
- Current regulatory profile: {{"mdr_class": "{mdr_class}", "ai_act_high_risk": {str(ai_act_class == 'High-risk').lower()}, "requires_dpia": {str(gdpr_requirement == 'DPIA required').lower()}}}
- Document section: {{"title": "Input Quality Assessment", "template": "input_quality_assessment"}}
- User request: {assessment_prompt}

## INSTRUCTIONS:
1. Use ONLY the provided regulatory sources
2. Be precise and cite specific provisions
3. Format responses clearly with citations
4. Indicate when information is uncertain
5. Suggest conservative approaches

## OUTPUT FORMAT:
[DRAFT - HUMAN REVIEW REQUIRED]
[Your response with inline citations like (MDR Annex VIII Rule 11)]
[END DRAFT]
"""
        
        # Generate assessment using Mistral (NO MOCK - will crash if not available)
        return self._generate_with_mistral(assessment_prompt, system_prompt)
    
    def generate_provisional_assessment(self, base_data: dict) -> dict:
        """
        Generate provisional assessment with additional information from user
        
        Args:
            base_data: Dictionary containing all available user input data including:
                - deviceName, deviceDescription, intendedPurpose
                - classification results (mdr_classification, ai_act_classification, gdpr_requirements)
                - justification and regulatory references
                - additional_information with questions and answers
                
        Returns:
            Dictionary with provisional assessment including updated classifications and LLM assessment
        """
        # Extract all available data
        device_name = base_data.get('deviceName', 'N/A')
        device_description = base_data.get('deviceDescription', 'N/A')
        intended_purpose = base_data.get('intendedPurpose', 'N/A')
        
        # Extract classification results
        mdr_class = base_data.get('mdr_classification', 'Unknown')
        ai_act_class = base_data.get('ai_act_classification', 'Unknown')
        gdpr_requirement = base_data.get('gdpr_requirements', 'Unknown')
        
        # Extract additional information
        additional_info = base_data.get('additional_information', {})
        questions = additional_info.get('questions', [])
        answers = additional_info.get('answers', {})
        
        # Create assessment prompt
        assessment_prompt = f"""
You are a regulatory compliance assistant generating a provisional assessment for an AI medical device.

## User Input Data:
- Device Name: {device_name}
- Device Description: {device_description}
- Intended Purpose: {intended_purpose}

## Initial Classification Results:
- MDR Classification: {mdr_class}
- AI Act Classification: {ai_act_class}
- GDPR Requirement: {gdpr_requirement}

## Additional Information Provided by User:
"""
        
        # Add questions and answers
        for i, question in enumerate(questions, 1):
            answer = answers.get(question, 'No answer provided')
            assessment_prompt += f"\n{i}. Q: {question}"
            assessment_prompt += f"\n   A: {answer}"
        
        assessment_prompt += f"""

## Your Task:
1. Review the initial classification in light of the additional information
2. Assess whether the additional information changes or confirms the initial classification
3. Provide an updated provisional assessment
4. Explain your reasoning with specific regulatory references
5. Generate a draft of minimalistic documentation for CE certification
6. Identify relevant TEF services that could assist with compliance
7. Be conservative and thorough in your assessment

## Important Constraints:
- NEVER make final legal determinations or compliance assertions
- NEVER provide definitive classifications without human review
- ALWAYS cite specific articles/annexes from MDR, AI Act, or GDPR
- ALWAYS mark output as "PROVISIONAL" and require human review
- ALWAYS be conservative in interpretations
- NEVER provide medical or legal advice

## Output Format:
{{
  "mdr_classification": "{mdr_class}",
  "mdr_applicable": {str(mdr_class != 'Not Applicable').lower()},
  "mdr_rules": ["Rule 11", "Rule 10"],
  "mdr_justification": ["Justification 1", "Justification 2"],
  
  "ai_act_classification": "{ai_act_class}",
  "ai_act_high_risk": {str(ai_act_class == 'High-risk').lower()},
  "ai_act_justification": "Justification for AI Act classification",
  
  "gdpr_requirements": "{gdpr_requirement}",
  "gdpr_requires_dpia": {str(gdpr_requirement == 'DPIA required').lower()},
  "gdpr_justification": "Justification for GDPR requirements",
  
  "llm_assessment": "Your detailed assessment explaining how the additional information affects the classification",
  
  "documentation_draft": "Draft documentation for CE certification process",
  
  "relevant_services": ["Service 1", "Service 2"]
}}
"""
        
        # Use system prompt template for consistency (or basic template if not available)
        if FULL_FUNCTIONALITY and 'SYSTEM_PROMPT_TEMPLATE' in locals():
            system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
                regulatory_profile=json.dumps({
                    'mdr_class': mdr_class,
                    'ai_act_high_risk': ai_act_class == 'High-risk',
                    'requires_dpia': gdpr_requirement == 'DPIA required'
                }),
                section_info=json.dumps({
                    'title': 'Provisional Assessment',
                    'template': 'provisional_assessment'
                }),
                user_request=assessment_prompt
            )
        else:
            # Basic system prompt for provisional assessment
            system_prompt = f"""
You are a regulatory compliance assistant generating provisional assessments for AI medical devices.

## CONSTRAINTS (MUST FOLLOW):
1. NEVER make final legal determinations or compliance assertions
2. NEVER provide definitive classifications without human review
3. ALWAYS cite specific articles/annexes from MDR, AI Act, or GDPR
4. ALWAYS mark output as "PROVISIONAL" and require human review
5. NEVER contradict the system's deterministic regulatory decisions
6. ALWAYS be conservative in interpretations
7. NEVER provide medical or legal advice

## CONTEXT:
- Current regulatory profile: {{"mdr_class": "{mdr_class}", "ai_act_high_risk": {str(ai_act_class == 'High-risk').lower()}, "requires_dpia": {str(gdpr_requirement == 'DPIA required').lower()}}}
- Document section: {{"title": "Provisional Assessment", "template": "provisional_assessment"}}
- User request: {assessment_prompt}

## INSTRUCTIONS:
1. Use ONLY the provided regulatory sources
2. Be precise and cite specific provisions
3. Format responses as valid JSON
4. Indicate when information is uncertain
5. Suggest conservative approaches

## OUTPUT FORMAT:
[PROVISIONAL ASSESSMENT - HUMAN REVIEW REQUIRED]
[Your response as valid JSON with inline citations]
[END PROVISIONAL ASSESSMENT]
"""
        
        # Generate assessment using Mistral (NO MOCK - will crash if not available)
        response_text = self._generate_with_mistral(assessment_prompt, system_prompt)
        
        # Try to parse the JSON response
        try:
            # Clean up the response to extract JSON
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                assessment_data = json.loads(json_str)
                return assessment_data
            else:
                # Return a structured response if JSON parsing fails
                return {
                    'mdr_classification': mdr_class,
                    'mdr_applicable': mdr_class != 'Not Applicable',
                    'mdr_rules': [],
                    'mdr_justification': ['Provisional assessment generated, human review required'],
                    
                    'ai_act_classification': ai_act_class,
                    'ai_act_high_risk': ai_act_class == 'High-risk',
                    'ai_act_justification': 'Provisional assessment generated, human review required',
                    
                    'gdpr_requirements': gdpr_requirement,
                    'gdpr_requires_dpia': gdpr_requirement == 'DPIA required',
                    'gdpr_justification': 'Provisional assessment generated, human review required',
                    
                    'llm_assessment': response_text,
                    
                    'documentation_draft': 'Draft documentation will be generated based on final assessment.',
                    
                    'relevant_services': ['Regulatory consulting', 'Documentation review', 'Compliance training']
                }
        except json.JSONDecodeError:
            # Return a structured response if JSON parsing fails
            return {
                'mdr_classification': mdr_class,
                'mdr_applicable': mdr_class != 'Not Applicable',
                'mdr_rules': [],
                'mdr_justification': ['Provisional assessment generated, human review required'],
                
                'ai_act_classification': ai_act_class,
                'ai_act_high_risk': ai_act_class == 'High-risk',
                'ai_act_justification': 'Provisional assessment generated, human review required',
                
                'gdpr_requirements': gdpr_requirement,
                'gdpr_requires_dpia': gdpr_requirement == 'DPIA required',
                'gdpr_justification': 'Provisional assessment generated, human review required',
                
                'llm_assessment': response_text,
                
                'documentation_draft': 'Draft documentation will be generated based on final assessment.',
                
                'relevant_services': ['Regulatory consulting', 'Documentation review', 'Compliance training']
            }
    
    
    def _extract_citations(self, text: str) -> List[Dict[str, str]]:
        """Extract regulatory citations from text"""
        citation_pattern = r'\((MDR|AI Act|GDPR) [A-Za-z0-9.]+ [0-9]+(?:\.[0-9]+)*\)'
        citations = re.findall(citation_pattern, text)
        
        return [
            {
                'regulation': match[0],
                'reference': match[1],
                'full_citation': match[0]
            }
            for match in citations
        ]