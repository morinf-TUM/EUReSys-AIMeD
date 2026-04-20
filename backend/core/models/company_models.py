from django.db import models
from .base_model import BaseModel

class Company(BaseModel):
    """
    Company information and regulatory compliance status
    """
    name = models.CharField(max_length=255)
    legal_entity_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100)
    headquarters_address = models.JSONField()  # Structured address
    eu_authorized_representative = models.JSONField(null=True, blank=True)
    contact_person = models.JSONField()
    
    # Compliance information
    has_quality_management_system = models.BooleanField(default=False)
    qms_certificate_number = models.CharField(max_length=100, null=True, blank=True)
    qms_certificate_issuer = models.CharField(max_length=100, null=True, blank=True)
    qms_certificate_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.registration_number})"
    
    class Meta:
        verbose_name_plural = "Companies"