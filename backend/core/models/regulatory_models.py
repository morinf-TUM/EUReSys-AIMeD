from django.db import models
from django.contrib.postgres.fields import ArrayField
from .base_model import BaseModel

class IntendedPurpose(BaseModel):
    """
    Intended purpose of the medical device (immutable once locked)
    """
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='intended_purposes')
    purpose_text = models.TextField()
    medical_indication = models.TextField()
    target_population = models.TextField()
    clinical_benefit = models.TextField()
    
    # MDR-specific fields
    is_medical_device = models.BooleanField()
    mdr_annex_i_compliance = models.BooleanField(default=False)
    
    # Locking mechanism
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Intended Purpose for {self.product.name}"
    
    def lock(self, user):
        """Make intended purpose immutable"""
        if not self.is_locked:
            self.is_locked = True
            self.locked_at = timezone.now()
            self.locked_by = user
            self.save()

class DeviceDescription(BaseModel):
    """
    Detailed device description including AI components
    """
    product_version = models.ForeignKey('ProductVersion', on_delete=models.CASCADE, related_name='device_descriptions')
    
    # Basic device information
    device_type = models.CharField(max_length=100)
    physical_description = models.TextField()
    
    # AI-specific information
    has_ai_components = models.BooleanField(default=False)
    ai_functionality_description = models.TextField(null=True, blank=True)
    ai_model_type = models.CharField(max_length=100, null=True, blank=True)
    ai_training_data_description = models.TextField(null=True, blank=True)
    
    # Software information
    is_software = models.BooleanField(default=False)
    software_classification = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"Device Description for {self.product_version}"

class RegulatoryProfile(BaseModel):
    """
    Comprehensive regulatory classification and status
    """
    product_version = models.ForeignKey('ProductVersion', on_delete=models.CASCADE, related_name='regulatory_profiles')
    
    # MDR Classification
    mdr_applicable = models.BooleanField(default=False)
    mdr_class = models.CharField(max_length=10, choices=[
        ('I', 'Class I'),
        ('IIa', 'Class IIa'), 
        ('IIb', 'Class IIb'),
        ('III', 'Class III')
    ], null=True, blank=True)
    mdr_classification_rules = ArrayField(models.CharField(max_length=20), null=True, blank=True)  # e.g., ['Rule 11']
    mdr_justification = models.TextField()
    
    # AI Act Classification
    ai_act_applicable = models.BooleanField(default=False)
    ai_act_high_risk = models.BooleanField(default=False)
    ai_act_high_risk_justification = models.TextField()
    ai_act_annex_ii_reference = models.CharField(max_length=50, null=True, blank=True)
    
    # GDPR Classification
    gdpr_applicable = models.BooleanField(default=False)
    processes_special_categories = models.BooleanField(default=False)
    requires_dpia = models.BooleanField(default=False)
    gdpr_legal_basis = models.CharField(max_length=100, null=True, blank=True)
    
    # Combined regulatory status
    overall_compliance_status = models.CharField(max_length=50, choices=[
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('documentation_complete', 'Documentation Complete'),
        ('ready_for_review', 'Ready for Notified Body Review')
    ], default='not_started')
    
    def __str__(self):
        return f"Regulatory Profile for {self.product_version}"