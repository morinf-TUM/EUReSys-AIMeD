from django.db import models
from django.contrib.postgres.fields import ArrayField
from .base_model import BaseModel

class LLMInteraction(BaseModel):
    """
    Record of all LLM interactions for audit and compliance purposes
    """
    # User and context
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    document_section = models.ForeignKey('DocumentSection', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Interaction metadata
    interaction_type = models.CharField(max_length=50, choices=[
        ('explanation', 'Regulatory Explanation'),
        ('draft_text', 'Draft Text Generation'),
        ('citation', 'Citation Assistance'),
        ('other', 'Other')
    ])
    
    # Content
    prompt = models.TextField()
    response = models.TextField()
    system_prompt_used = models.TextField()
    
    # RAG context
    rag_context = models.JSONField(default=list)  # List of context documents used
    
    # Usage metrics
    tokens_used = models.PositiveIntegerField(default=0)
    response_time_ms = models.PositiveIntegerField(default=0)
    
    # Status and review
    status = models.CharField(max_length=50, choices=[
        ('generated', 'Generated'),
        ('reviewed', 'Human Reviewed'),
        ('approved', 'Approved for Use'),
        ('rejected', 'Rejected'),
        ('modified', 'Modified by Human')
    ], default='generated')
    
    reviewed_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    review_date = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True, null=True)
    
    # Compliance flags
    contains_prohibited_content = models.BooleanField(default=False)
    requires_legal_review = models.BooleanField(default=True)
    
    def __str__(self):
        return f"LLM Interaction {self.id} ({self.interaction_type})"

class RegulatorySource(BaseModel):
    """
    Regulatory source documents for RAG system
    """
    # Source metadata
    regulation = models.CharField(max_length=50, choices=[
        ('MDR', 'Medical Device Regulation'),
        ('AI_Act', 'AI Act'),
        ('GDPR', 'General Data Protection Regulation'),
        ('Other', 'Other')
    ])
    
    source_type = models.CharField(max_length=50, choices=[
        ('regulation', 'Regulation'),
        ('annex', 'Annex'),
        ('guidance', 'Guidance Document'),
        ('implementation', 'Implementation Guide')
    ])
    
    title = models.CharField(max_length=255)
    reference_code = models.CharField(max_length=100, unique=True)  # e.g., "MDR Annex VIII"
    
    # Content
    content = models.TextField()
    content_hash = models.CharField(max_length=64)  # SHA-256 hash of content
    
    # Metadata
    publication_date = models.DateField()
    version = models.CharField(max_length=50)
    
    # Embedding information (for RAG)
    embedding_vector = ArrayField(models.FloatField(), null=True, blank=True)
    embedding_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.regulation} {self.reference_code}: {self.title}"