from django.views import View
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
import json
from datetime import datetime
from .models.regulatory_models import RegulatoryProfile
from .models.product_models import Product, ProductVersion
from .recommendation_engine import RecommendationEngine

# Configure logging
logging.basicConfig(
    filename='llm_service_errors.log',
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Mock regulatory questions for testing
MOCK_REGULATORY_QUESTIONS = {
    1: [
        {
            "id": "q1",
            "text": "Device Name",
            "regulation": "General",
            "reference": "Device Identification",
            "answerType": "text",
            "required": True,
            "helpText": "Enter the name of your medical device"
        },
        {
            "id": "q2",
            "text": "Device Description",
            "regulation": "General",
            "reference": "Device Description",
            "answerType": "text",
            "required": True,
            "helpText": "Provide a brief description of your device including its main components and functionality"
        },
        {
            "id": "q3",
            "text": "Is your device intended to be used for medical purposes?",
            "regulation": "MDR",
            "reference": "MDR Article 2(1)",
            "answerType": "boolean",
            "required": True
        },
        {
            "id": "q4", 
            "text": "Does your device incorporate or use artificial intelligence?",
            "regulation": "AI Act",
            "reference": "AI Act Article 3(1)",
            "answerType": "boolean",
            "required": True
        }
    ],
    2: [
        {
            "id": "q3",
            "text": "What is the intended purpose of your device?",
            "regulation": "MDR",
            "reference": "MDR Annex I",
            "answerType": "text",
            "required": True
        },
        {
            "id": "q4",
            "text": "Does your device process personal data?",
            "regulation": "GDPR",
            "reference": "GDPR Article 4(1)",
            "answerType": "boolean",
            "required": True
        }
    ],
    3: [
        {
            "id": "q5",
            "text": "What is the risk class of your device under MDR?",
            "regulation": "MDR",
            "reference": "MDR Annex VIII",
            "answerType": "multiple-choice",
            "options": ["Class I", "Class IIa", "Class IIb", "Class III"],
            "required": True
        }
    ]
}

@method_decorator(csrf_exempt, name='dispatch')
class RegulatoryQuestionsView(View):
    """Get regulatory questions for a specific step"""
    
    def get(self, request):
        try:
            step = int(request.GET.get('step', 1))
            
            # Get questions for this step (use mock data for now)
            questions = MOCK_REGULATORY_QUESTIONS.get(step, [])
            
            return JsonResponse({
                'success': True,
                'data': questions
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to fetch questions: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class RegulatoryProfileView(View):
    """Create and manage regulatory profiles"""
    
    def post(self, request):
        """Create a new regulatory profile"""
        try:
            data = json.loads(request.body)
            
            # For now, create a mock profile since we don't have the full product/version structure
            mock_profile = {
                'id': 'temp-profile-id-123',
                'deviceName': data.get('deviceName', 'Unknown Device'),
                'deviceDescription': data.get('deviceDescription', ''),
                'intendedPurpose': data.get('intendedPurpose', ''),
                'classification': data.get('classification', {
                    'mdrApplicable': False,
                    'aiActApplicable': False,
                    'gdprApplicable': False,
                    'overallComplianceStatus': 'Undetermined'
                }),
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                'status': 'draft'
            }
            
            return JsonResponse({
                'success': True,
                'data': mock_profile
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to create profile: {str(e)}'
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class RegulatoryAnswersView(View):
    """Submit regulatory answers and get classification"""
    
    def post(self, request, profile_id):
        try:
            data = json.loads(request.body)
            answers = data.get('answers', [])
            
            # Mock classification logic based on answers
            classification = self._determine_classification(answers)
            
            return JsonResponse({
                'success': True,
                'data': classification
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to process answers: {str(e)}'
            }, status=500)
    
    def _determine_classification(self, answers):
        """Mock classification logic"""
        # Default classification
        classification = {
            'mdrApplicable': False,
            'mdrClass': 'Not Applicable',
            'mdrRules': [],
            'mdrJustification': ['Device does not meet medical device definition'],
            
            'aiActApplicable': False,
            'aiActHighRisk': False,
            'aiActJustification': ['Device does not use AI'],
            'aiActAnnexReference': '',
            
            'gdprApplicable': False,
            'gdprRequiresDPIA': False,
            'gdprLegalBases': [],
            'gdprJustification': ['Device does not process personal data'],
            
            'overallComplianceStatus': 'Compliant'
        }
        
        # Analyze answers to determine classification
        for answer in answers:
            if answer['questionId'] == 'q3' and answer['answer'] is True:
                # Medical device
                classification['mdrApplicable'] = True
                classification['mdrClass'] = 'I'
                classification['mdrRules'] = ['Rule 11']
                classification['mdrJustification'] = ['Software for diagnosis/monitoring']
            
            if answer['questionId'] == 'q4' and answer['answer'] is True:
                # AI device
                classification['aiActApplicable'] = True
                classification['aiActHighRisk'] = True
                classification['aiActJustification'] = ['Medical device AI system']
                classification['aiActAnnexReference'] = 'Annex II, Point 1'
            
            if answer['questionId'] == 'q4' and answer['answer'] is True:
                # GDPR applicable
                classification['gdprApplicable'] = True
                classification['gdprRequiresDPIA'] = True
                classification['gdprLegalBases'] = ['Article 6(1)(a) - Consent']
                classification['gdprJustification'] = ['Processes health data']
        
        # Determine overall status
        if classification['mdrApplicable'] or classification['aiActApplicable'] or classification['gdprApplicable']:
            classification['overallComplianceStatus'] = 'Conditional'
        
        return classification


class RecommendationView(View):
    """
    API endpoint for generating regulatory recommendations
    """
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            print("📥 Recommendation request received")
            # Parse request body
            data = json.loads(request.body)
            
            # Validate input
            if not data or 'deviceInfo' not in data or 'intendedPurpose' not in data:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid input: deviceInfo and intendedPurpose are required'
                }, status=400)
            
            # Generate recommendation
            engine = RecommendationEngine()
            recommendation = engine.generate_recommendation(
                data['deviceInfo'],
                data['intendedPurpose']
            )
            
            # Add LLM verification of the classification
            import traceback
            from backend.llm.llm_service import LLMService
            print("🔄 Creating LLM service for classification verification")
            llm_service = LLMService()
            print(f"🔄 LLM service created, mistral_client: {llm_service.mistral_client}")
            
            # Generate LLM verification comment
            print("🔄 Calling generate_classification_verification")
            llm_verification = llm_service.generate_classification_verification(
                classification_data=recommendation,
                device_info=data['deviceInfo'],
                intended_purpose=data['intendedPurpose']
            )
            print(f"🔄 Got verification: {llm_verification[:100]}...")
            
            # Add verification to the response
            recommendation['llm_verification_comment'] = llm_verification
            print("✅ LLM verification successful")
            
            # Return successful response
            return JsonResponse({
                'success': True,
                'data': recommendation
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Recommendation failed: {str(e)}'
            }, status=500)
            
            


class ProvisionalAssessmentView(View):
    """
    API endpoint for generating provisional assessment with additional information
    """
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            print("📥 Provisional assessment request received")
            # Parse request body
            data = json.loads(request.body)
            
            # Validate input
            if not data or 'baseData' not in data:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid input: baseData is required'
                }, status=400)
            
            # Generate provisional assessment
            try:
                import traceback
                from backend.llm.llm_service import LLMService
                print("🔄 Creating LLM service for provisional assessment")
                llm_service = LLMService()
                print(f"🔄 LLM service created, mistral_client: {llm_service.mistral_client}")
                
                # Generate provisional assessment with additional information
                print("🔄 Calling generate_provisional_assessment")
                provisional_assessment = llm_service.generate_provisional_assessment(
                    base_data=data['baseData']
                )
                print(f"🔄 Got provisional assessment with keys: {list(provisional_assessment.keys()) if isinstance(provisional_assessment, dict) else type(provisional_assessment)}")

                print("✅ LLM provisional assessment successful")
                
                return JsonResponse({
                    'success': True,
                    'data': provisional_assessment
                })
                
            except Exception as e:
                print(f"❌ LLM provisional assessment failed: {e}")
                traceback.print_exc()
                return JsonResponse({
                    'success': False,
                    'error': f'LLM provisional assessment failed: {str(e)}'
                }, status=500)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Provisional assessment failed: {str(e)}'
            }, status=500)

   

class InputQualityAssessmentView(View):
    """
    API endpoint for generating LLM assessment of user input quality
    """
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            print("📥 Input quality assessment request received")
            # Parse request body
            data = json.loads(request.body)
            
            # Validate input
            if not data or 'baseData' not in data:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid input: baseData is required'
                }, status=400)
            
            # Generate input quality assessment
            try:
                import traceback
                from backend.llm.llm_service import LLMService
                print("🔄 Creating LLM service for input quality assessment")
                llm_service = LLMService()
                print(f"🔄 LLM service created, mistral_client: {llm_service.mistral_client}")
                
                # Generate LLM assessment
                print("🔄 Calling generate_input_quality_assessment")
                llm_assessment = llm_service.generate_input_quality_assessment(
                    base_data=data['baseData']
                )
                print(f"🔄 Got assessment: {llm_assessment[:100]}...")
                
                print("✅ LLM input quality assessment successful")
                
                return JsonResponse({
                    'success': True,
                    'data': {
                        'llm_assessment': llm_assessment
                    }
                })
                
            except Exception as e:
                print(f"❌ LLM input quality assessment failed: {e}")
                traceback.print_exc()
                return JsonResponse({
                    'success': False,
                    'error': f'LLM assessment failed: {str(e)}'
                }, status=500)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Input quality assessment failed: {str(e)}'
            }, status=500)

