"""
Views for the EU AI Medical Device Regulatory System
"""

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

class HealthCheckView(View):
    """Simple health check endpoint"""
    
    def get(self, request):
        return JsonResponse({
            'status': 'ok',
            'message': 'EU AI Medical Device Regulatory System API is running',
            'version': '1.0.0'
        })

class ProductListCreateView(View):
    """List and create products"""
    
    def get(self, request):
        # Mock response for testing
        return JsonResponse([
            {
                'id': '123e4567-e89b-12d3-a456-426614174000',
                'name': 'Test Product',
                'description': 'AI Medical Device',
                'created_at': '2024-01-01T00:00:00Z'
            }
        ], safe=False)

class ProductRetrieveUpdateView(View):
    """Retrieve and update specific product"""
    
    def get(self, request, pk):
        # Mock response for testing
        return JsonResponse({
            'id': pk,
            'name': 'Test Product',
            'description': 'AI Medical Device',
            'created_at': '2024-01-01T00:00:00Z'
        })

class ProductVersionListCreateView(View):
    """List and create product versions"""
    
    def get(self, request, product_id):
        # Mock response for testing
        return JsonResponse([
            {
                'id': '123e4567-e89b-12d3-a456-426614174001',
                'version_number': '1.0',
                'release_date': '2024-01-01',
                'is_active': True
            }
        ], safe=False)

class ProductVersionRetrieveUpdateView(View):
    """Retrieve and update specific product version"""
    
    def get(self, request, product_id, pk):
        # Mock response for testing
        return JsonResponse({
            'id': pk,
            'version_number': '1.0',
            'release_date': '2024-01-01',
            'is_active': True
        })

class RegulatoryProfileView(View):
    """Regulatory profile management"""
    
    def get(self, request, product_id, version_id):
        # Mock response for testing
        return JsonResponse({
            'mdr_class': 'IIb',
            'ai_act_high_risk': True,
            'gdpr_requires_dpia': True,
            'overall_compliance': 'Conditional'
        })

class DecisionTreeView(View):
    """Decision tree management"""
    
    def get(self, request, product_id):
        # Mock response for testing
        return JsonResponse({
            'current_step': 1,
            'total_steps': 6,
            'progress': 16
        })

class DecisionTreeStepsView(View):
    """Decision tree steps"""
    
    def get(self, request, product_id):
        # Mock response for testing
        return JsonResponse([
            {
                'step': 1,
                'title': 'Device Information',
                'questions': [
                    {
                        'id': 'q1',
                        'text': 'Is this a medical device?',
                        'type': 'boolean'
                    }
                ]
            }
        ], safe=False)

class LLMExplanationView(View):
    """LLM explanation generation"""
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        # Mock response for testing
        return JsonResponse({
            'explanation': 'This is a mock explanation for testing purposes.',
            'citations': ['MDR Article 1', 'AI Act Annex II']
        })

class LLMDraftTextView(View):
    """LLM draft text generation"""
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        # Mock response for testing
        return JsonResponse({
            'draft_text': '[DRAFT - HUMAN REVIEW REQUIRED]\n\nThis is a mock draft text.',
            'warnings': ['This is a mock response for testing']
        })

class DocumentSetView(View):
    """Document set management"""
    
    def get(self, request, product_id, version_id):
        # Mock response for testing
        return JsonResponse({
            'documents': [
                {
                    'id': 'doc-1',
                    'title': 'Technical Documentation',
                    'status': 'draft'
                }
            ]
        })

class DocumentSectionView(View):
    """Document section management"""
    
    def get(self, request, doc_set_id):
        # Mock response for testing
        return JsonResponse({
            'sections': [
                {
                    'id': 'sec-1',
                    'title': 'Device Description',
                    'content': 'Mock content for testing',
                    'status': 'draft'
                }
            ]
        })


from django.http import FileResponse
from django.views.decorators.http import require_GET
from django.conf import settings
import os
from pathlib import Path

@require_GET
def download_template(request, filename):
    """
    Force download of a template file with proper Content-Disposition header
    """
    # Get the templates directory
    templates_dir = Path(settings.BASE_DIR) / 'extracted_templates'
    file_path = templates_dir / filename
    
    # Check if file exists
    if not file_path.exists():
        from django.http import Http404
        raise Http404("Template file not found")
    
    # Open the file and create response
    try:
        file = open(file_path, 'rb')
        response = FileResponse(file)
        
        # Set Content-Disposition header to force download
        response["Content-Disposition"] = f"attachment; filename=\"{filename}\""
        response["Content-Type"] = "application/octet-stream"
        
        return response
    except Exception as e:
        from django.http import HttpResponseServerError
        return HttpResponseServerError(str(e))

