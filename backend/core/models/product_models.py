from django.db import models
from .base_model import BaseModel

class Product(BaseModel):
    """
    Medical device product information
    """
    company = models.ForeignKey('Company', on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=255)
    internal_reference = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    
    # Regulatory status
    current_regulatory_profile = models.ForeignKey('RegulatoryProfile', on_delete=models.SET_NULL, null=True)
    
    # Versioning
    current_version = models.ForeignKey('ProductVersion', on_delete=models.SET_NULL, null=True, related_name='+')
    
    def __str__(self):
        return f"{self.name} ({self.internal_reference})"

class ProductVersion(BaseModel):
    """
    Versioned product information with regulatory snapshots
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='versions')
    version_number = models.CharField(max_length=50)  # e.g., "1.0", "2.0-beta"
    release_date = models.DateField()
    release_notes = models.TextField()
    
    # Regulatory snapshot
    regulatory_snapshot = models.JSONField()  # Full regulatory profile at this version
    
    # Change information
    change_from_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    change_type = models.CharField(max_length=50, choices=[
        ('initial', 'Initial Release'),
        ('minor', 'Minor Update'),
        ('substantial', 'Substantial Change'),
        ('major', 'Major Revision')
    ])
    
    def __str__(self):
        return f"{self.product.name} v{self.version_number}"