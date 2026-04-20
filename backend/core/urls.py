"""
URL configuration for regulatory core application
"""

from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views
from .auth_views import RegisterView, LoginView, LogoutView, CSRFTokenView
from .user_management_views import UserManagementView, ResetPasswordView
from .regulatory_views import ProvisionalAssessmentView, RegulatoryQuestionsView, RegulatoryProfileView, RegulatoryAnswersView, RecommendationView, InputQualityAssessmentView

app_name = 'core'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/csrf/', CSRFTokenView.as_view(), name='csrf-token'),
    
    # User management endpoints
    path('users/', UserManagementView.as_view(), name='user-list'),
    path('users/<str:email>/', UserManagementView.as_view(), name='user-delete'),
    path('users/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # Regulatory scoping endpoints (mock for testing)
    path('regulatory/questions/', RegulatoryQuestionsView.as_view(), name='regulatory-questions'),
    path('regulatory/profiles/', RegulatoryProfileView.as_view(), name='regulatory-profiles'),
    path('regulatory/profiles/<str:profile_id>/answers/', RegulatoryAnswersView.as_view(), name='regulatory-answers'),
    
    # Health check endpoint
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    
    # Product endpoints
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<uuid:pk>/', views.ProductRetrieveUpdateView.as_view(), name='product-detail'),
    
    # Product version endpoints
    path('products/<uuid:product_id>/versions/', views.ProductVersionListCreateView.as_view(), name='product-version-list'),
    path('products/<uuid:product_id>/versions/<uuid:pk>/', views.ProductVersionRetrieveUpdateView.as_view(), name='product-version-detail'),
    
    # Regulatory profile endpoints
    path('products/<uuid:product_id>/versions/<uuid:version_id>/regulatory-profile/', 
         views.RegulatoryProfileView.as_view(), name='regulatory-profile'),
    
    # Decision tree endpoints
    path('products/<uuid:product_id>/decision-tree/', views.DecisionTreeView.as_view(), name='decision-tree'),
    path('products/<uuid:product_id>/decision-tree/steps/', views.DecisionTreeStepsView.as_view(), name='decision-tree-steps'),
    
    # Recommendation endpoint
    path('regulatory/recommendation/', csrf_exempt(RecommendationView.as_view()), name='regulatory-recommendation'),
    
    # Input quality assessment endpoint
    path('regulatory/input-quality-assessment/', csrf_exempt(InputQualityAssessmentView.as_view()), name='input-quality-assessment'),
    
    # Provisional assessment endpoint
    path('regulatory/provisional-assessment/', csrf_exempt(ProvisionalAssessmentView.as_view()), name='provisional-assessment'),
    
    # LLM interaction endpoints
    path('llm/explanation/', views.LLMExplanationView.as_view(), name='llm-explanation'),
    path('llm/draft-text/', views.LLMDraftTextView.as_view(), name='llm-draft-text'),
    
    # Documentation endpoints
    path('products/<uuid:product_id>/versions/<uuid:version_id>/documents/', 
         views.DocumentSetView.as_view(), name='document-set'),
    path('documents/<uuid:doc_set_id>/sections/', views.DocumentSectionView.as_view(), name='document-sections'),
    # Template download endpoint
    path("templates/download/<str:filename>", views.download_template, name="download-template"),
]
