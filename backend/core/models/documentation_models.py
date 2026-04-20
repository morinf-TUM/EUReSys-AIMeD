from django.db import models
from django.contrib.postgres.fields import ArrayField
from .base_model import BaseModel

class DocumentSet(BaseModel):
    """
    Complete set of regulatory documentation for a product version
    """
    product_version = models.ForeignKey('ProductVersion', on_delete=models.CASCADE, related_name='document_sets')
    regulatory_profile = models.ForeignKey('RegulatoryProfile', on_delete=models.PROTECT, related_name='document_sets')
    
    # Documentation status
    status = models.CharField(max_length=50, choices=[
        ('draft', 'Draft'),
        ('in_review', 'In Review'),
        ('approved', 'Approved'),
        ('submitted', 'Submitted to Notified Body'),
        ('final', 'Final')
    ], default='draft')
    
    # Versioning
    document_version = models.CharField(max_length=50, default='1.0')
    
    def __str__(self):
        return f"Documentation for {self.product_version} v{self.document_version}"

class DocumentSection(BaseModel):
    """
    Individual section of regulatory documentation
    """
    document_set = models.ForeignKey(DocumentSet, on_delete=models.CASCADE, related_name='sections')
    
    # Section metadata
    title = models.CharField(max_length=255)
    section_number = models.CharField(max_length=50)  # e.g., "3.2"
    template_reference = models.CharField(max_length=100)  # Reference to documentation template
    
    # Content
    content = models.TextField(blank=True, null=True)
    content_status = models.CharField(max_length=50, choices=[
        ('empty', 'Empty'),
        ('draft', 'Draft'),
        ('llm_generated', 'LLM Generated'),
        ('human_reviewed', 'Human Reviewed'),
        ('approved', 'Approved')
    ], default='empty')
    
    # Regulatory references
    regulatory_requirements = ArrayField(models.CharField(max_length=100), blank=True, default=list)
    
    # LLM generation tracking
    llm_generation_count = models.PositiveIntegerField(default=0)
    last_llm_interaction = models.ForeignKey('LLMInteraction', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.section_number} {self.title}"

class EvidenceItem(BaseModel):
    """
    Supporting evidence for regulatory documentation
    """
    document_section = models.ForeignKey(DocumentSection, on_delete=models.CASCADE, related_name='evidence_items')
    
    # Evidence metadata
    evidence_type = models.CharField(max_length=100, choices=[
        ('clinical_data', 'Clinical Data'),
        ('technical_testing', 'Technical Testing'),
        ('literature', 'Scientific Literature'),
        ('risk_analysis', 'Risk Analysis'),
        ('other', 'Other')
    ])
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # File reference (would be handled by file storage system)
    file_reference = models.CharField(max_length=255, blank=True, null=True)
    file_hash = models.CharField(max_length=64, blank=True, null=True)  # SHA-256 hash
    
    # Status
    status = models.CharField(max_length=50, choices=[
        ('draft', 'Draft'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved')
    ], default='draft')
    
    def __str__(self):
        return f"Evidence: {self.title}"