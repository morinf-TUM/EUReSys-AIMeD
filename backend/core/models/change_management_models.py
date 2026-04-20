from django.db import models
from django.contrib.postgres.fields import ArrayField
from .base_model import BaseModel

class ChangeEvent(BaseModel):
    """
    Record of a change to a product or regulatory profile
    """
    product_version = models.ForeignKey('ProductVersion', on_delete=models.CASCADE, related_name='change_events')
    
    # Change metadata
    change_type = models.CharField(max_length=50, choices=[
        ('software_update', 'Software Update'),
        ('algorithm_change', 'Algorithm Change'),
        ('intended_purpose', 'Intended Purpose Change'),
        ('design_change', 'Design Change'),
        ('documentation_update', 'Documentation Update'),
        ('other', 'Other')
    ])
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Change details
    change_date = models.DateField()
    implemented_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Impact assessment
    requires_reclassification = models.BooleanField(default=False)
    requires_new_certification = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Change: {self.title} ({self.change_type})"

class ChangeImpactAssessment(BaseModel):
    """
    Impact assessment for a change event
    """
    change_event = models.ForeignKey(ChangeEvent, on_delete=models.CASCADE, related_name='impact_assessments')
    
    # Assessment details
    assessment_date = models.DateField()
    assessed_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # MDR impact assessment
    mdr_classification_impact = models.CharField(max_length=100, choices=[
        ('none', 'No Impact'),
        ('minor', 'Minor Impact'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Change')
    ], default='none')
    
    mdr_impact_justification = models.TextField()
    
    # AI Act impact assessment
    ai_act_impact = models.CharField(max_length=100, choices=[
        ('none', 'No Impact'),
        ('minor', 'Minor Impact'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Change')
    ], default='none')
    
    ai_act_impact_justification = models.TextField()
    
    # GDPR impact assessment
    gdpr_impact = models.CharField(max_length=100, choices=[
        ('none', 'No Impact'),
        ('minor', 'Minor Impact'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Change')
    ], default='none')
    
    gdpr_impact_justification = models.TextField()
    
    # Overall assessment
    overall_impact = models.CharField(max_length=100, choices=[
        ('none', 'No Impact'),
        ('minor', 'Minor Impact'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Change')
    ], default='none')
    
    requires_notified_body_review = models.BooleanField(default=False)
    requires_new_technical_documentation = models.BooleanField(default=False)
    
    # Action items
    action_items = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    
    def __str__(self):
        return f"Impact Assessment for {self.change_event.title}"